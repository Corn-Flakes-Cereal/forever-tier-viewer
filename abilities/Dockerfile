FROM nginx:1.27-alpine
ENV PORT=80
COPY index.html /usr/share/nginx/html/index.html
# The official image runs envsubst on /etc/nginx/templates/*.template at start,
# so nginx listens on whatever PORT Railway injects.
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
