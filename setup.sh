echo "🛡️  SecureU Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Create directories
echo "📁 Creating directory structure..."
mkdir -p backend/src/{config,middleware,models,routes,services,utils,logs}
mkdir -p frontend/src/{components,context,services}
mkdir -p database

echo "✅ Directories created"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend

if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found!"
    exit 1
fi

echo "Installing backend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    
    # Generate secrets
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Update .env file
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    sed -i.bak "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" .env
    sed -i.bak "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|g" .env
    
    rm .env.bak
    
    echo "✅ Generated secure keys in backend/.env"
    echo "⚠️  Please update DATABASE_URL in backend/.env with your PostgreSQL credentials"
fi

cd ..
echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi

echo "Installing frontend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
    echo "✅ Frontend .env created"
fi

cd ..
echo "✅ Frontend setup complete"
echo ""

# Database setup
echo "🗄️  Database setup..."
echo "To create the database, run these commands:"
echo ""
echo "  psql -U postgres"
echo "  CREATE DATABASE secureu_db;"
echo "  CREATE USER secureu_user WITH PASSWORD 'your_password';"
echo "  GRANT ALL PRIVILEGES ON DATABASE secureu_db TO secureu_user;"
echo "  \q"
echo ""
echo "Then run the schema:"
echo "  psql -U secureu_user -d secureu_db -f database/schema.sql"
echo ""

# Summary
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Create PostgreSQL database (see commands above)"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "Or use Docker:"
echo "  docker-compose up -d"
echo ""
echo "Happy coding! 🚀"