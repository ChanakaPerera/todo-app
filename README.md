# Todo App - Docker Setup

## Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose (comes with Docker Desktop)

## 🐳 Run the Project

1. **Clone the repository**:
   ```bash
   git clone <repository>
   cd todo-app

2. **Build and start all containers**:
   ```bash
   docker-compose up --build

**This will**:

1.Build the React frontend

2.Build the Node.js backend

3.Start MySQL database

4.Create network connections between containers



**Access the application**:

Frontend: http://localhost:3000

Backend API: http://localhost:5000

MySQL Admin: Port 3306 (use credentials from docker-compose.yml)


3. **Stop the project**:
   ```bash
   docker-compose down