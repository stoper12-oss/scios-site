FROM nginx:alpine

# Static public customer website. Private administration and paid product artifacts are excluded.
COPY index.html autobuild.html project-auditor.html services.html capabilities.html addons.html custom-services.html customer-access.html privacy.html terms.html success.html cancel.html willis-store.html willis-success.html products.json willis-products.json fulfillment-config.json 404.html site.css site.js custom-request.js site.webmanifest robots.txt sitemap.xml /usr/share/nginx/html/

EXPOSE 80
