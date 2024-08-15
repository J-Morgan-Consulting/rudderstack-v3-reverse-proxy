# Rudderstack SDK V3 Reverse Proxy
This code is designed to work with a Cloudflare worker to form a reverse proxy when serving the Rudderstack V3 SDK.
## Why would you want this?
Modern browsers have built in cookie and tracking blockers that actively try to prevent tools like Rudderstack from doing its job.  The best way around this is to use a reverse proxy to route the requests that are made to Rudderstack through your own domain first.  That way these tracking prevention measures don't see it as an external request.

## This reverse proxy is designed to work with multiple domains at a time.  I.e you have the one worker for all of your domains. 
To add in a new domain to redirect, instead just add in a new key value pair into the defined Cloudflare namespace in the script.  The default will be called "cloudflare-reverse-proxy" unless you change it to be something else.

# Getting Started
Once you have cloned this repository you will need to edit the wrangler file to match the KV binding to your own one.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/J-Morgan-Consulting/rudderstack-v3-reverse-proxy)