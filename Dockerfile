# Stage 1: Build the React application
FROM registry.cern.ch/docker.io/library/node:18.16.0 AS build
WORKDIR /app
COPY package*.json ./
# If you're using yarn, you might also want to copy yarn.lock
COPY package*.json yarn.lock ./
# RUN npm i -g yarn
RUN yarn install
# RUN npm install --legacy-peer-deps
COPY . .
RUN yarn build

# Stage 2: Set up a production-ready Nginx server to serve the application
FROM registry.cern.ch/docker.io/library/nginx:1.23.4 AS prod-nginx

# Support running as an arbitrary user which belongs to the root group
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY default.conf /etc/nginx/conf.d/

# Comment user directive as master process is run as user in OpenShift anyhow
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Copy assets from the build stage
COPY --from=build /app/build .

# Expose the port nginx is running on
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
