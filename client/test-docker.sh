#!/bin/bash

# Test script for Docker build
set -e

echo "🧪 Testing Docker build for vlayer client..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test 1: Check if required files exist
print_status "Checking required files..."
required_files=(
    "foundry.toml"
    "remappings.txt"
    "soldeer.lock"
    ".gitmodules"
    "vlayer/package.json"
    "vlayer/tsconfig.json"
    "vlayer/vite.config.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        print_error "$file is missing!"
        exit 1
    fi
done

# Test 2: Check if required directories exist
print_status "Checking required directories..."
required_dirs=(
    "src"
    "script"
    "test"
    "lib"
    "dependencies"
    "vlayer/src"
    "vlayer/public"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ exists"
    else
        print_error "$dir/ is missing!"
        exit 1
    fi
done

# Test 3: Test Foundry build stage only
print_status "Testing Foundry build stage..."
if docker build --target foundry-builder -t vlayer-foundry-test . > /dev/null 2>&1; then
    print_success "Foundry build stage completed successfully!"
    
    # Check if out directory was created
    if docker run --rm vlayer-foundry-test test -d out; then
        print_success "Foundry generated 'out' directory successfully!"
        docker run --rm vlayer-foundry-test ls -la out/ | head -10
    else
        print_error "Foundry did not generate 'out' directory!"
        exit 1
    fi
else
    print_error "Foundry build stage failed!"
    exit 1
fi

# Test 4: Test client build stage
print_status "Testing client build stage..."
if docker build --target client-builder -t vlayer-client-test . > /dev/null 2>&1; then
    print_success "Client build stage completed successfully!"
    
    # Check if dist directory was created
    if docker run --rm vlayer-client-test test -d dist; then
        print_success "Client generated 'dist' directory successfully!"
    else
        print_error "Client did not generate 'dist' directory!"
        exit 1
    fi
else
    print_error "Client build stage failed!"
    exit 1
fi

# Test 5: Test full production build
print_status "Testing full production build..."
if docker build -t vlayer-client-full-test . > /dev/null 2>&1; then
    print_success "Full production build completed successfully!"
    
    # Clean up test images
    docker rmi vlayer-foundry-test vlayer-client-test vlayer-client-full-test > /dev/null 2>&1
    
    print_success "All Docker build tests passed! 🎉"
else
    print_error "Full production build failed!"
    exit 1
fi

echo ""
print_success "Docker build verification completed successfully!"
print_status "You can now run: docker-compose up --build" 