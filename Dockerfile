FROM nginx:alpine

# Static public website. The browser-only simulator is included and clearly labeled as a preview.
COPY index.html privacy.html terms.html 404.html site.css site.js site.webmanifest robots.txt sitemap.xml demo.html demo.css demo.js /usr/share/nginx/html/

EXPOSE 80
