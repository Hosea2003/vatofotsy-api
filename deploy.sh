#!/bin/bash

# Production deployment script for Vatofotsy API

set -e

echo "🚀 Deploying Vatofotsy API to production..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "📝 Please copy .env.production.example to .env.production and configure it"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Pull latest images (if using pre-built images)
echo "📦 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "🔍 Waiting for services to be healthy..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up (healthy)"; then
        echo "✅ Services are healthy!"
        break
    fi
    
    if [ $counter -eq $((timeout - 1)) ]; then
        echo "❌ Timeout waiting for services to be healthy"
        echo "📋 Container logs:"
        docker-compose -f docker-compose.prod.yml logs --tail=20
        exit 1
    fi
    
    echo "⏳ Waiting... ($((counter + 1))/$timeout)"
    sleep 2
    counter=$((counter + 1))
done

# Show running containers
echo "📊 Running containers:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=10

echo "✅ Deployment completed successfully!"
echo "🌐 API should be available at: $(grep BASE_URL .env.production | cut -d '=' -f2)"
echo "📖 API documentation: $(grep BASE_URL .env.production | cut -d '=' -f2)/docs/api"

# Optional: Run database migrations
read -p "🔄 Do you want to run database migrations? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec vatofotsy-api npm run migration:run
    echo "✅ Migrations completed!"
fi

echo "🎉 Deployment finished!"
