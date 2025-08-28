# ClipSpin Backend - Comprehensive Documentation

## 🎯 Project Overview

ClipSpin is a video generation platform that automatically creates engaging video content from various input sources (YouTube, Instagram, TikTok). The platform supports multiple video generation types including slide shows, text audiograms, talking head videos, and professional videos.

## 🏗️ Architecture

The project follows a **microservices architecture** with two main applications:

### 1. Backend API (`apps/backend`)

- **NestJS** REST API server
- Handles user authentication, project management, and file operations
- Provides Swagger API documentation
- Manages user subscriptions and credit systems

### 2. Queue Processor (`apps/queue`)

- **NestJS** background job processor
- Handles video generation workflows using Bull queues
- Integrates with multiple AI services (OpenAI, HeyGen, FAL.ai, etc.)
- Processes video analysis and content generation

## 🛠️ Technology Stack

### Core Technologies

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Queue System**: Redis + Bull
- **Authentication**: JWT + Passport.js
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Payment**: Stripe
- **Email**: Resend
- **SMS**: Custom SMS service

### AI Services Integration

- **OpenAI**: Content generation and analysis
- **HeyGen**: Avatar and voice generation
- **FAL.ai**: AI video processing
- **Creatomate**: Video creation
- **Google GenAI**: Additional AI capabilities

### Development Tools

- **TypeScript**: Type-safe development
- **Docker**: Containerization
- **ESLint + Prettier**: Code formatting
- **Jest**: Testing framework
- **Swagger**: API documentation

## 📁 Project Structure

```
clipspin-backend/
├── apps/
│   ├── backend/                 # Main API server
│   │   ├── src/
│   │   │   ├── api/            # API modules
│   │   │   │   ├── auth/       # Authentication
│   │   │   │   ├── projects/   # Project management
│   │   │   │   ├── users/      # User management
│   │   │   │   ├── files/      # File operations
│   │   │   │   └── ...         # Other API modules
│   │   │   ├── common/         # Shared utilities
│   │   │   ├── models/         # MongoDB schemas
│   │   │   ├── services/       # External service integrations
│   │   │   └── main.ts         # Application entry point
│   │   └── tsconfig.app.json
│   │
│   └── queue/                  # Background job processor
│       ├── src/
│       │   ├── queus/          # Queue processors
│       │   │   ├── main-queue/ # Main workflow orchestrator
│       │   │   ├── analyze-video/
│       │   │   ├── content-generator/
│       │   │   └── ...         # Other queue processors
│       │   ├── services/       # AI service integrations
│       │   └── main.ts         # Queue processor entry point
│       └── tsconfig.app.json
│
├── docker-compose.yaml         # Docker orchestration
├── dockerfile                  # Backend container
├── queue.dockerfile           # Queue processor container
├── package.json               # Dependencies and scripts
└── README.md                  # This documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB instance
- Redis instance
- Cloudflare R2 account
- Stripe account
- Various AI service API keys

### Environment Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd clipspin-backend
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

```env
# Database
DATABASE_URI=mongodb://localhost:27017/clipspin
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=clipspin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudflare R2
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
HEYGEN_API_KEY=your_heygen_api_key
FAL_AI_KEY=your_fal_ai_key
CREATOMATE_API_KEY=your_creatomate_api_key

# Documentation
DOCS_PASSWORD=your_docs_password
```

4. **Start with Docker**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

5. **Development Mode**

```bash
# Start backend in development mode
npm run start:dev

# Start queue processor in development mode
cd apps/queue && npm run start:dev
```

## 📚 API Documentation

Once the application is running, you can access the Swagger API documentation at:

- **URL**: `http://localhost:3210/api/docs`
- **Username**: `admin`
- **Password**: Value of `DOCS_PASSWORD` from your `.env` file

## 🔧 Core Features

### 1. User Management

- **Authentication**: JWT-based authentication with Google OAuth support
- **User Profiles**: User information and preferences management
- **Role-based Access**: Admin and user roles with different permissions

### 2. Project Management

- **Project Types**:
  - `slide_show`: PowerPoint-style presentations
  - `text_audiogram`: Text-to-speech videos
  - `talking_head`: AI avatar videos
  - `veo3`: Advanced video generation
  - `professional`: Professional video content

- **Input Sources**:
  - YouTube videos
  - Instagram posts
  - TikTok videos

- **Project Status Flow**:
  ```
  QUEUED → IN_PROGRESS → COMPLETED
     ↓         ↓
  CANCELLED  FAILED
  ```

### 3. Credit System

- **Subscription Plans**: Different pricing tiers with credit allocations
- **Credit Usage**: Track credits used per project type
- **Credit Return**: Automatic credit refund on project failure

### 4. Video Generation Workflow

The video generation process follows this pipeline:

1. **Input Fetching**: Extract content from provided URLs
2. **Content Analysis**: Analyze and understand the input content
3. **Script Generation**: Create engaging scripts using AI
4. **Asset Generation**: Generate images, audio, and video elements
5. **Video Assembly**: Combine all elements into final video
6. **Output Delivery**: Store and provide download links

## 🔄 Queue System Architecture

The queue system uses **Bull** with Redis and processes jobs in the following order:

### Main Queue Processors:

1. **Input Video Parser**: Extracts content from input URLs
2. **Analyze Video**: Analyzes video content and generates insights
3. **Content Generator**: Creates scripts and content ideas
4. **Slide Show Generator**: Creates slide show videos
5. **Text Audiogram Generator**: Creates text-to-speech videos
6. **Talking Head Generator**: Creates AI avatar videos
7. **Veo3 Generator**: Creates advanced AI videos
8. **Output Processor**: Handles final video processing and storage

### Queue Flow:

```
Main Queue → Input Parser → Analyzer → Content Generator → Specific Generator → Output
```

## 🗄️ Database Schema

### Key Collections:

#### Users (`users`)

- User authentication and profile information
- Subscription and credit management
- Role-based permissions

#### Projects (`projects`)

- Project metadata and configuration
- Input sources and output files
- Status tracking and progress monitoring
- Credit usage tracking

#### Subscription Plans (`subscription_plans`)

- Plan pricing and features
- Credit allocations per project type
- Stripe integration

#### User Subscriptions (`user_subscriptions`)

- Active user subscriptions
- Credit balance tracking
- Billing information

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Different permissions for users and admins
- **API Protection**: All endpoints protected except public ones
- **Input Validation**: Comprehensive request validation using class-validator

### Data Protection

- **Environment Variables**: Sensitive data stored in environment variables
- **Input Sanitization**: All user inputs validated and sanitized
- **Error Handling**: Secure error responses without sensitive information

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Structure

- **Unit Tests**: Individual service and controller testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing

## 🚀 Deployment

### Production Deployment

1. **Build the application**:

```bash
npm run build
```

2. **Docker deployment**:

```bash
docker-compose -f docker-compose.prod.yaml up -d
```

3. **Environment configuration**:

- Set production environment variables
- Configure production database and Redis
- Set up SSL certificates
- Configure load balancers

### Monitoring

- **Application Logs**: Structured logging with different levels
- **Queue Monitoring**: Bull dashboard for queue monitoring
- **Database Monitoring**: MongoDB performance monitoring
- **Error Tracking**: Centralized error tracking and alerting

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with custom rules
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for code quality

### Git Workflow

1. **Feature Branches**: Create feature branches from main
2. **Pull Requests**: Code review required for all changes
3. **Testing**: All tests must pass before merging
4. **Documentation**: Update documentation for new features

### API Design Principles

- **RESTful Design**: Follow REST principles
- **Consistent Response Format**: Standardized API responses
- **Error Handling**: Comprehensive error handling
- **Validation**: Input validation on all endpoints
- **Documentation**: Swagger documentation for all APIs

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check MongoDB connection
docker-compose logs mongodb

# Verify connection string
echo $DATABASE_URI
```

#### 2. Redis Connection Issues

```bash
# Check Redis status
docker-compose logs redis

# Test Redis connection
redis-cli ping
```

#### 3. Queue Processing Issues

```bash
# Check queue logs
docker-compose logs queue

# Monitor queue status
# Access Bull dashboard at http://localhost:3210/admin/queues
```

#### 4. File Upload Issues

```bash
# Check R2 configuration
# Verify bucket permissions
# Check file size limits
```

### Debug Mode

```bash
# Start in debug mode
npm run start:debug

# Attach debugger
# Use VS Code debug configuration
```

## 📞 Support & Contact

### Development Team

- **Lead Developer**: @nurikjohn
- **Project Manager**: [Contact Information]
- **DevOps**: [Contact Information]

### Useful Links

- **API Documentation**: `http://localhost:3210/api/docs`
- **Queue Dashboard**: `http://localhost:3210/admin/queues`
- **Git Repository**: [Repository URL]
- **Issue Tracker**: [Issue Tracker URL]

### Emergency Contacts

- **Production Issues**: [Emergency Contact]
- **Security Issues**: [Security Contact]
- **Infrastructure**: [Infrastructure Contact]

---

## 📝 Changelog

### Version 1.0.0 (Current)

- Initial release with core video generation features
- Support for multiple video types
- User authentication and subscription system
- Queue-based video processing
- AI service integrations

### Upcoming Features

- Advanced video editing capabilities
- Real-time collaboration
- Mobile app API endpoints
- Enhanced analytics and reporting
- Multi-language support

---

**Note**: This documentation is maintained by the development team. For the most up-to-date information, please refer to the codebase and API documentation.
