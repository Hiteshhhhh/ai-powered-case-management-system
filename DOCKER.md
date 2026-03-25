# 🐳 Docker & Deployment Guide

## 1. Dockerfile (Standard Node.js)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

## 2. Deployment Steps

### Step 1: Environment Setup
- Ensure `GEMINI_API_KEY` is available in the environment.
- Set `NODE_ENV=production` for optimized builds.

### Step 2: Containerization
- Build the image: `docker build -t ai-financial-advisor .`
- Run the container: `docker run -p 3000:3000 ai-financial-advisor`

## 3. Security Considerations
- **JWT Secret**: Use a strong, unique secret for token signing.
- **API Key Protection**: Never expose the Gemini API key in public repositories.
