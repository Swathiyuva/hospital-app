# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Ensure React builds with correct public path
ARG PUBLIC_URL=/
ENV PUBLIC_URL=$PUBLIC_URL
RUN npm run build

# Optional: serve locally via nginx container
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
