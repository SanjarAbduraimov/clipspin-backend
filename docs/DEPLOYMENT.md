# Deployment Documentation

## 🚀 Overview

This document covers the deployment process for ClipSpin backend services, including Docker containerization, environment configuration, and production deployment procedures.

## 🐳 Docker Configuration

### Docker Compose Setup

The project uses Docker Compose for local development and production deployment.

**File**: `docker-compose.yaml`

```yaml
version: '3.7'

services:
  backend:
    build:
      context: .
      dockerfile: ./dockerfile
    container_name: backend
    restart: always
    ports:
      - '3210:3000'
    env_file: .env
    depends_on:
      - redis

  queue:
    build:
      context: .
      dockerfile: ./queue.dockerfile
    container_name: queue
    restart: always
    env_file: .env
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

### Backend Dockerfile

**File**: `dockerfile`

```dockerfile
# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "start:prod"]
```

### Queue Dockerfile

**File**: `queue.dockerfile`

```dockerfile
# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the queue application
RUN yarn build

# Start the queue processor
CMD ["yarn", "start:queue:prod"]
```

## 🔧 Environment Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URI=mongodb://localhost:27017/clipspin
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=clipspin

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

# =============================================================================
# JWT CONFIGURATION
# =============================================================================
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# =============================================================================
# CLOUDFLARE R2 CONFIGURATION
# =============================================================================
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_REGION=auto

# =============================================================================
# STRIPE CONFIGURATION
# =============================================================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# =============================================================================
# EMAIL CONFIGURATION (RESEND)
# =============================================================================
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# =============================================================================
# SMS CONFIGURATION
# =============================================================================
SMS_API_KEY=your_sms_api_key
SMS_FROM_NUMBER=+1234567890

# =============================================================================
# AI SERVICES CONFIGURATION
# =============================================================================
OPENAI_API_KEY=sk-your_openai_api_key
HEYGEN_API_KEY=your_heygen_api_key
FAL_AI_KEY=your_fal_ai_key
CREATOMATE_API_KEY=your_creatomate_api_key
GOOGLE_GENAI_API_KEY=your_google_genai_key

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# =============================================================================
# DOCUMENTATION CONFIGURATION
# =============================================================================
DOCS_PASSWORD=your_docs_password

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
LOG_LEVEL=info
LOG_FORMAT=json

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

### Environment-Specific Configurations

#### Development Environment

```env
NODE_ENV=development
LOG_LEVEL=debug
LOG_FORMAT=simple
CORS_ORIGIN=http://localhost:3000
```

#### Staging Environment

```env
NODE_ENV=staging
LOG_LEVEL=info
LOG_FORMAT=json
CORS_ORIGIN=https://staging.yourdomain.com
```

#### Production Environment

```env
NODE_ENV=production
LOG_LEVEL=warn
LOG_FORMAT=json
CORS_ORIGIN=https://yourdomain.com
```

## 🚀 Deployment Procedures

### 1. Local Development Deployment

```bash
# Clone the repository
git clone <repository-url>
cd clipspin-backend

# Install dependencies
yarn install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Staging Deployment

```bash
# Build and deploy to staging
docker-compose -f docker-compose.staging.yaml up -d

# Run database migrations
docker-compose exec backend yarn migration:run

# Verify deployment
curl https://staging-api.yourdomain.com/health
```

### 3. Production Deployment

#### Prerequisites

- Docker and Docker Compose installed
- MongoDB instance (Atlas or self-hosted)
- Redis instance (ElastiCache or self-hosted)
- Cloudflare R2 bucket configured
- Stripe account configured
- Domain and SSL certificates

#### Deployment Steps

1. **Prepare Production Environment**

```bash
# Create production environment file
cp .env.example .env.production

# Edit production environment variables
nano .env.production
```

2. **Build and Deploy**

```bash
# Build production images
docker-compose -f docker-compose.prod.yaml build

# Deploy to production
docker-compose -f docker-compose.prod.yaml up -d

# Verify deployment
docker-compose -f docker-compose.prod.yaml ps
```

3. **Run Database Migrations**

```bash
# Run migrations
docker-compose -f docker-compose.prod.yaml exec backend yarn migration:run

# Verify database connection
docker-compose -f docker-compose.prod.yaml exec backend yarn db:check
```

4. **Health Checks**

```bash
# Check application health
curl https://api.yourdomain.com/health

# Check queue health
curl https://api.yourdomain.com/queue/health

# Check database connection
curl https://api.yourdomain.com/db/health
```

### 4. Production Docker Compose

**File**: `docker-compose.prod.yaml`

```yaml
version: '3.7'

services:
  backend:
    build:
      context: .
      dockerfile: ./dockerfile
      args:
        NODE_ENV: production
    container_name: clipspin-backend
    restart: unless-stopped
    ports:
      - '3000:3000'
    env_file: .env.production
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
    depends_on:
      - redis
    networks:
      - clipspin-network

  queue:
    build:
      context: .
      dockerfile: ./queue.dockerfile
      args:
        NODE_ENV: production
    container_name: clipspin-queue
    restart: unless-stopped
    env_file: .env.production
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
    depends_on:
      - redis
    networks:
      - clipspin-network

  redis:
    image: redis:7-alpine
    container_name: clipspin-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - clipspin-network

  nginx:
    image: nginx:alpine
    container_name: clipspin-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - clipspin-network

volumes:
  redis_data:

networks:
  clipspin-network:
    driver: bridge
```

## 🔒 Security Configuration

### Nginx Configuration

**File**: `nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name api.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req zone=login burst=5 nodelay;

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://backend;
            access_log off;
        }
    }
}
```

### Redis Security Configuration

**File**: `redis.conf`

```conf
# Network
bind 127.0.0.1
protected-mode yes
port 6379

# Security
requirepass your_redis_password

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfilename "appendonly.aof"

# Logging
loglevel notice
logfile /var/log/redis/redis.log

# Performance
tcp-keepalive 300
timeout 0
```

## 📊 Monitoring and Logging

### Application Logging

Configure structured logging in the application:

```typescript
// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'clipspin-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  )
}
```

### Health Check Endpoints

```typescript
// Health check controller
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    }
  }

  @Get('db')
  async checkDatabase() {
    try {
      await this.mongoose.connection.db.admin().ping()
      return { status: 'ok', database: 'connected' }
    } catch (error) {
      return { status: 'error', database: 'disconnected' }
    }
  }

  @Get('queue')
  async checkQueue() {
    try {
      const queues = ['main-queue', 'input-parser', 'analyze-video']
      const status = {}

      for (const queueName of queues) {
        const queue = this.bullQueue.getQueue(queueName)
        const waiting = await queue.getWaiting()
        const active = await queue.getActive()
        const failed = await queue.getFailed()

        status[queueName] = {
          waiting: waiting.length,
          active: active.length,
          failed: failed.length,
        }
      }

      return { status: 'ok', queues: status }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker images
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./dockerfile
          push: true
          tags: your-registry/clipspin-backend:latest

      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/clipspin
            docker-compose -f docker-compose.prod.yaml pull
            docker-compose -f docker-compose.prod.yaml up -d
            docker system prune -f
```

## 🛠️ Maintenance and Updates

### Database Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

# Create backup
docker exec clipspin-mongodb mongodump --out /dump

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz /dump

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://your-backup-bucket/

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

### Log Rotation

```bash
# Logrotate configuration
# File: /etc/logrotate.d/clipspin
/opt/clipspin/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker exec clipspin-backend kill -USR1 1
    endscript
}
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yaml pull
docker-compose -f docker-compose.prod.yaml up -d

# Clean up unused Docker resources
docker system prune -f
docker volume prune -f
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check container logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart container
docker-compose restart backend
```

#### 2. Database Connection Issues

```bash
# Check database connectivity
docker exec clipspin-backend yarn db:check

# Check MongoDB logs
docker logs clipspin-mongodb

# Restart database
docker-compose restart mongodb
```

#### 3. Queue Processing Issues

```bash
# Check queue status
curl https://api.yourdomain.com/queue/health

# Check Redis connection
docker exec clipspin-redis redis-cli ping

# Restart queue processor
docker-compose restart queue
```

#### 4. Memory Issues

```bash
# Check memory usage
docker stats

# Check disk space
df -h

# Clean up Docker
docker system prune -a
```

### Performance Monitoring

```bash
# Monitor system resources
htop

# Monitor Docker containers
docker stats

# Monitor application logs
tail -f logs/combined.log

# Monitor queue performance
curl https://api.yourdomain.com/queue/metrics
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Monitoring tools set up
- [ ] Backup strategy implemented

### Deployment

- [ ] Docker images built
- [ ] Containers deployed
- [ ] Health checks passed
- [ ] Database migrations run
- [ ] Queue processors started
- [ ] SSL certificates verified

### Post-Deployment

- [ ] Application functionality tested
- [ ] API endpoints verified
- [ ] Queue processing tested
- [ ] Monitoring alerts configured
- [ ] Performance metrics collected
- [ ] Documentation updated
