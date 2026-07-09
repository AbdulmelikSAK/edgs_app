#!/bin/bash
set -e

echo "=============================================="
echo "   EDGS Application Installer & Startup"
echo "=============================================="

# Check requirements
echo "🔎 Checking dependencies..."
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "⚠️ Warning: Node.js/npm is not installed on the host. Local builds won't be checkable outside docker."
fi

# Starting docker containers
echo "🚀 Building and starting containerized services (DB, Object Storage, API, Backoffice)..."
docker compose up -d --build

echo "📦 Installing backoffice local dependencies..."
cd backoffice
npm install
cd ..

echo "📦 Installing mobile client local dependencies..."
cd mobile
npm install
cd ..

echo "=============================================="
echo "✅ EDGS Application successfully started!"
echo "=============================================="
echo "📖 API Swagger Documentation: http://localhost:3000/api/docs"
echo "💻 Admin Backoffice Dashboard: http://localhost:8080"
echo "📱 Expo Mobile Client: Ready inside /mobile folder"
echo "🔑 Default Admin: admin@edgs.fr / admin_secret"
echo "🔑 Default Driver PIN: 1234"
echo "=============================================="
