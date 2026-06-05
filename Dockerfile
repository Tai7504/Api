FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p /app/uploads

# Persist uploads directory
VOLUME ["/app/uploads"]

# Expose API port
EXPOSE 8080

# Wait for DB to be ready before migrate + seed + start
CMD ["sh", "-c", "echo 'Waiting for database...' && sleep 20 && npx prisma db push && npm run seed:all && npm start"]