echo "🎯 Git Setup Script for SecureU"
echo "================================"
echo ""

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Create .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# OS files
.DS_Store

# IDE files
.vscode/
.idea/

# Build
/build
/dist
EOF
    echo "✅ .gitignore created"
fi

# Stage all files
echo ""
echo "Staging files for initial commit..."
git add .

# Create initial commit
echo ""
echo "Creating initial commit..."
git commit -m "feat: initial SecureU application setup

- Backend API with JWT authentication
- Frontend React application
- PostgreSQL database schema
- Docker configuration
- Security middleware (rate limiting, validation, encryption)
- Breach checking and phishing detection
- Comprehensive documentation"

echo ""
echo "================================"
echo "✅ Git Setup Complete!"
echo "================================"
echo ""
echo "Repository initialized with secure defaults."
echo "⚠️  Remember to never commit .env files!"
echo ""
echo "To connect to remote repository:"
echo "  git remote add origin <your-repo-url>"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
