FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Run as non-root user
USER node

# Start application
CMD ["npm", "start"]