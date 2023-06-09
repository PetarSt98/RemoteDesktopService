# Stage 1: Build the React application
FROM registry.cern.ch/docker.io/library/node:18.16.0 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Set up a production-ready Nginx server to serve the application
FROM registry.cern.ch/docker.io/library/nginx:1.23.4 AS prod-nginx

# Support running as an arbitrary user which belongs to the root group
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/

# Comment user directive as master process is run as user in OpenShift anyhow
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
COPY --from=build /app/build .
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]