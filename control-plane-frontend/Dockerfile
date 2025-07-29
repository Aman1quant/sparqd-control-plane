# Stage 1: Build the app
FROM node:23-slim AS builder

WORKDIR /app

# Accept build args passed from docker-compose or CLI
ARG VITE_API_URL
ARG VITE_JUPYTER_API_URL
ARG VITE_AIRFLOW_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_NEW_API
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_KEYCLOAK_REALM
ARG VITE_AUTH_USERNAME
ARG VITE_AUTH_PASSWORD
ARG VITE_CONTROL_PLANE_API_BASE_URL

# Set as ENV so Vite can access them
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_JUPYTER_API_URL=$VITE_JUPYTER_API_URL
ENV VITE_AIRFLOW_URL=$VITE_AIRFLOW_URL
ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL
ENV VITE_NEW_API=$VITE_NEW_API
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
ENV VITE_AUTH_USERNAME=$VITE_AUTH_USERNAME
ENV VITE_AUTH_PASSWORD=$VITE_AUTH_PASSWORD
ENV VITE_CONTROL_PLANE_API_BASE_URL=$VITE_CONTROL_PLANE_API_BASE_URL

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Copy custom nginx config (see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose default Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
