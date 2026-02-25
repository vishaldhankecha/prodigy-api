#!/bin/bash

set -e

echo "🚀 Starting Mac development environment setup..."

# ----------------------------
# 1️⃣ Install Homebrew
# ----------------------------
if ! command -v brew &> /dev/null
then
    echo "🍺 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew already installed"
fi

# ----------------------------
# 2️⃣ Update Brew
# ----------------------------
brew update

# ----------------------------
# 3️⃣ Install Node (LTS)
# ----------------------------
if ! command -v node &> /dev/null
then
    echo "🟢 Installing Node LTS..."
    brew install node
else
    echo "✅ Node already installed"
fi

# ----------------------------
# 4️⃣ Install MySQL
# ----------------------------
if ! command -v mysql &> /dev/null
then
    echo "🗄 Installing MySQL..."
    brew install mysql
    brew services start mysql
else
    echo "✅ MySQL already installed"
fi

# ----------------------------
# 5️⃣ Install Docker
# ----------------------------
if ! command -v docker &> /dev/null
then
    echo "🐳 Installing Docker..."
    brew install --cask docker
    echo "⚠️ Please open Docker.app manually once after installation."
else
    echo "✅ Docker already installed"
fi

# ----------------------------
# 6️⃣ Install Git
# ----------------------------
if ! command -v git &> /dev/null
then
    echo "📦 Installing Git..."
    brew install git
else
    echo "✅ Git already installed"
fi

# ----------------------------
# 7️⃣ Global NPM Tools
# ----------------------------
echo "📦 Installing global dev tools..."
npm install -g ts-node-dev typescript

# ----------------------------
# 8️⃣ Verify Versions
# ----------------------------
echo "🔍 Verifying installations..."

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "MySQL version: $(mysql --version)"
echo "Git version: $(git --version)"

echo "🎉 Mac setup complete!"