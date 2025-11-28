#!/bin/bash
# Git Setup Script for WSL

echo "========================================="
echo "Git Setup for WSL"
echo "========================================="
echo ""

# Navigate to project directory
cd "/mnt/c/Users/Owner/Desktop/Santa's_workshop" || exit 1

echo "Current directory: $(pwd)"
echo ""

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""

# Check git status
echo "Checking git status..."
git status

echo ""
echo "========================================="
echo "Next steps:"
echo "========================================="
echo ""
echo "1. Add remote:"
echo "   git remote add origin https://github.com/Mamasmess333/Santas_Workshop.git"
echo ""
echo "2. Add files:"
echo "   git add ."
echo ""
echo "3. Commit:"
echo "   git commit -m 'Initial commit: Santa\\'s Workshop Puzzle Game'"
echo ""
echo "4. Push:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

