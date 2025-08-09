#!/bin/bash

# AMHSJ Production Deployment Script
set -e

echo "🚀 Starting AMHSJ deployment..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET is not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
npm run migrate

# Seed database if needed (only for fresh deployments)
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    npm run seed
fi

# Start the application
echo "✅ Deployment complete! Starting application..."
npm start
