FROM nginx:alpine

# Static public customer website. Private administration and development assets are excluded.
COPY index.html services.html capabilities.html addons.html custom-services.html customer-access.html privacy.html terms.html success.html cancel.html products.json 404.html site.css site.js custom-request.js site.webmanifest robots.txt sitemap.xml /usr/share/nginx/html/

EXPOSE 80
