const RUDDERSTACK_SDK_V3_URL = 'https://cdn.rudderlabs.com/v3';
const POLYFILL_URL = 'https://polyfill-fastly.io/v3/polyfill.min.js?version=3.111.0&features=Symbol%2CPromise&callback=rudderAnalyticsMount';

async function getDataPlaneUrl(hostname) {
    try {
        const dataPlaneUrl = await KV.get(hostname);
        if (!dataPlaneUrl) {
            console.warn(`No data plane URL found for hostname: ${hostname}`);
            return null;
        }
        return dataPlaneUrl;
    } catch (error) {
        console.error(`Error fetching data plane URL for hostname ${hostname}: ${error.message}`);
        throw new Error(`Failed to retrieve data plane URL for ${hostname}`);
    }
}

async function handleRequest(request) {
    try {

        const url = new URL(request.url);
        let targetURL;

        if (url.pathname.startsWith('/v3')) {
            targetURL = `${RUDDERSTACK_SDK_V3_URL}${url.pathname.substring(3)}`;
        } else if (url.pathname === '/v3/polyfill.min.js?version=3.111.0&features=Symbol%2CPromise&callback=rudderAnalyticsMount') {
            targetURL = POLYFILL_URL;
        } else {
            // Get the Referer header to determine the origin
            const referer = request.headers.get('Referer');
            if (!referer) {
                console.warn('Referer header not found');
                return new Response('Referer header not found', { status: 400 });
            }

            const originUrl = new URL(referer);
            const originHostname = originUrl.hostname;

            // Get the data plane URL based on the origin
            const RUDDERSTACK_DATA_PLANE_URL = await getDataPlaneUrl(originHostname);
            if (!RUDDERSTACK_DATA_PLANE_URL) {
                console.error('RUDDERSTACK_DATA_PLANE_URL not found for hostname:', originHostname);
                return new Response('RUDDERSTACK_DATA_PLANE_URL not found', { status: 500 });
            }
            targetURL = `https://${RUDDERSTACK_DATA_PLANE_URL}${url.pathname}`;
        }

        let modifiedRequest = new Request(targetURL, request);
        
        let response = await fetch(modifiedRequest);
        
        // Clone the response to modify headers for CORS
        let modifiedResponse = new Response(response.body, response);
        modifiedResponse.headers.set("Access-Control-Allow-Origin", "*");

        return modifiedResponse;
        
    } catch (error) {
        console.error('Error processing request:', error.message);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });