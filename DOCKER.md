# 🐳 Docker & Deployment Guide

## 1. Dockerfile (Multi-stage Build)

```dockerfile
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build Backend (.NET Core Example)
# (In this prototype, we use the same Node environment)
FROM node:20-alpine
WORKDIR /app
COPY --from=frontend-build /app/dist ./dist
COPY --from=frontend-build /app/package*.json ./
RUN npm install --production
COPY server.ts .
# In production, you would compile TS to JS
EXPOSE 3000
CMD ["node", "server.js"]
```

## 2. Azure Deployment Steps

### Step 1: Resource Provisioning
- Create an **Azure Container Registry (ACR)**.
- Create an **Azure SQL Database**.
- Create an **Azure App Service** (Web App for Containers).

### Step 2: Secret Management
- Store `DB_CONNECTION_STRING`, `JWT_SECRET`, and `AI_API_KEY` in **Azure Key Vault**.
- Link Key Vault to App Service using **Managed Identity**.

### Step 3: CI/CD
- Configure GitHub Actions to build the Docker image, push to ACR, and trigger a deployment to App Service.

## 3. Scaling Considerations
- **Horizontal Scaling**: Enable "Autoscale" in Azure App Service based on CPU/Memory usage.
- **Database Scaling**: Use Azure SQL "Elastic Pools" for cost-effective scaling.
