#!/bin/bash

# Build script for vlayer client with Foundry setup
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build-prod     Build production Docker image"
    echo "  build-dev      Build development Docker image"
    echo "  run-prod       Run production container"
    echo "  run-dev        Run development container with hot reload"
    echo "  up             Start services with docker-compose"
    echo "  up-dev         Start development services with docker-compose"
    echo "  down           Stop all services"
    echo "  clean          Remove all containers, images, and volumes"
    echo "  logs           Show container logs"
    echo "  shell          Access running container shell"
    echo "  test-foundry   Test Foundry build stage only"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build-prod    # Build production image"
    echo "  $0 run-dev       # Start development server"
    echo "  $0 up-dev        # Start with docker-compose in dev mode"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build production image
build_prod() {
    print_status "Building production Docker image..."
    docker build -t vlayer-client:latest .
    print_success "Production image built successfully!"
}

# Function to build development image
build_dev() {
    print_status "Building development Docker image..."
    docker build -f Dockerfile.dev -t vlayer-client:dev .
    print_success "Development image built successfully!"
}

# Function to run production container
run_prod() {
    print_status "Starting production container..."
    docker run -d \
        --name vlayer-client-prod \
        -p 3000:3000 \
        --restart unless-stopped \
        vlayer-client:latest
    print_success "Production container started at http://localhost:3000"
}

# Function to run development container
run_dev() {
    print_status "Starting development container with hot reload..."
    docker run -it \
        --name vlayer-client-dev \
        -p 5173:5173 \
        -v "$(pwd)/vlayer/src:/app/src" \
        -v "$(pwd)/vlayer/public:/app/public" \
        -v "$(pwd)/out:/app/out:ro" \
        --rm \
        vlayer-client:dev
}

# Function to start with docker-compose
compose_up() {
    print_status "Starting services with docker-compose..."
    docker-compose up --build -d
    print_success "Services started! Check http://localhost:3000"
}

# Function to start development with docker-compose
compose_up_dev() {
    print_status "Starting development services with docker-compose..."
    docker-compose --profile dev up vlayer-client-dev --build
}

# Function to stop services
compose_down() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped!"
}

# Function to clean up everything
clean_all() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        
        # Stop and remove containers
        docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
        
        # Remove individual containers if they exist
        docker rm -f vlayer-client-prod vlayer-client-dev 2>/dev/null || true
        
        # Remove images
        docker rmi vlayer-client:latest vlayer-client:dev 2>/dev/null || true
        
        # Prune unused resources
        docker system prune -f
        
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing container logs..."
    if docker-compose ps -q > /dev/null 2>&1; then
        docker-compose logs -f
    else
        print_warning "No docker-compose services running. Showing individual container logs..."
        docker logs -f vlayer-client-prod 2>/dev/null || \
        docker logs -f vlayer-client-dev 2>/dev/null || \
        print_error "No containers found."
    fi
}

# Function to access container shell
access_shell() {
    print_status "Accessing container shell..."
    if docker ps --format "table {{.Names}}" | grep -q vlayer-client; then
        container=$(docker ps --format "{{.Names}}" | grep vlayer-client | head -1)
        print_status "Accessing shell in container: $container"
        docker exec -it "$container" sh
    else
        print_error "No running vlayer-client containers found."
    fi
}

# Function to test Foundry build stage
test_foundry() {
    print_status "Testing Foundry build stage..."
    docker build --target foundry-builder -t vlayer-foundry-test .
    print_success "Foundry build stage completed successfully!"
    
    print_status "Checking generated files..."
    docker run --rm vlayer-foundry-test ls -la out/
}

# Main script logic
case "${1:-help}" in
    "build-prod")
        check_docker
        build_prod
        ;;
    "build-dev")
        check_docker
        build_dev
        ;;
    "run-prod")
        check_docker
        run_prod
        ;;
    "run-dev")
        check_docker
        run_dev
        ;;
    "up")
        check_docker
        compose_up
        ;;
    "up-dev")
        check_docker
        compose_up_dev
        ;;
    "down")
        check_docker
        compose_down
        ;;
    "clean")
        check_docker
        clean_all
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "shell")
        check_docker
        access_shell
        ;;
    "test-foundry")
        check_docker
        test_foundry
        ;;
    "help"|*)
        show_usage
        ;;
esac 