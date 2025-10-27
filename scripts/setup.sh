#!/bin/bash

# CineVerse Setup Script
echo "🎬 Setting up CineVerse Movie Streaming Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -pe "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION'))" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp .env.local.example .env.local
    echo "⚠️  Please update .env.local with your actual configuration values"
else
    echo "✅ Environment file already exists"
fi

# Create placeholder images directory
echo "🖼️  Setting up placeholder images..."
mkdir -p public/images
mkdir -p public/icons

# Generate basic icons (you can replace these with actual icons)
echo "Creating placeholder icons..."

# Check if dependencies are installed correctly
echo "🔍 Verifying installation..."
if npm list --depth=0 > /dev/null 2>&1; then
    echo "✅ All dependencies installed successfully"
else
    echo "⚠️  Some dependencies may have issues. Please check npm list output."
fi

# Run type checking
echo "🔍 Running type check..."
if npm run type-check > /dev/null 2>&1; then
    echo "✅ TypeScript types are valid"
else
    echo "⚠️  TypeScript errors detected. Please check your code."
fi

echo "
🎉 Setup complete!

Next steps:
1. Update .env.local with your Supabase and API configuration
2. Set up your Supabase project and database
3. Configure authentication providers in Supabase
4. Run 'npm run dev' to start the development server

For detailed setup instructions, see:
- README.md
- docs/DEPLOYMENT.md

Happy coding! 🚀
"