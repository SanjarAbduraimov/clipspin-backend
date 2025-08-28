# Developer Guide

## 🚀 Quick Start for Developers

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd clipspin-backend

# 2. Install dependencies
yarn install

# 3. Copy environment file
cp .env.example .env

# 4. Configure environment variables
# Edit .env with your local configuration

# 5. Start services
docker-compose up -d

# 6. Start development servers
yarn start:dev          # Backend API
cd apps/queue && yarn start:dev  # Queue processor
```

## 📁 Project Structure Overview

```
clipspin-backend/
├── apps/
│   ├── backend/                 # Main API server
│   │   ├── src/
│   │   │   ├── api/            # API modules
│   │   │   │   ├── auth/       # Authentication
│   │   │   │   ├── projects/   # Project management
│   │   │   │   ├── users/      # User management
│   │   │   │   └── ...         # Other modules
│   │   │   ├── common/         # Shared utilities
│   │   │   ├── models/         # MongoDB schemas
│   │   │   ├── services/       # External services
│   │   │   └── main.ts         # Entry point
│   │   └── tsconfig.app.json
│   │
│   └── queue/                  # Background job processor
│       ├── src/
│       │   ├── queus/          # Queue processors
│       │   ├── services/       # AI service integrations
│       │   └── main.ts         # Entry point
│       └── tsconfig.app.json
│
├── docs/                       # Documentation
├── docker-compose.yaml         # Docker orchestration
└── package.json               # Dependencies
```

## 🔧 Development Commands

### Backend Development

```bash
# Start development server
yarn start:dev

# Start with debug mode
yarn start:debug

# Build for production
yarn build

# Run tests
yarn test
yarn test:watch
yarn test:cov

# Run e2e tests
yarn test:e2e

# Lint and format code
yarn lint
yarn format
```

### Queue Development

```bash
# Start queue processor
cd apps/queue
yarn start:dev

# Build queue processor
yarn build

# Test queue processors
yarn test
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs queue

# Stop services
docker-compose down

# Rebuild containers
docker-compose build
docker-compose up -d
```

## 🏗️ Architecture Patterns

### Module Structure

Each API module follows this structure:

```
module-name/
├── dto/                    # Data Transfer Objects
│   ├── create.dto.ts
│   ├── update.dto.ts
│   └── response.dto.ts
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.module.ts
└── index.ts
```

### Service Pattern

```typescript
@Injectable()
export class ExampleService extends BaseService<Example> {
  constructor(
    @InjectModel(Example.name) private readonly model: Model<Example>,
    private readonly otherService: OtherService,
  ) {
    super(model)
  }

  async customMethod(data: any): Promise<Example> {
    // Custom business logic
    return this.create(data)
  }
}
```

### Controller Pattern

```typescript
@Controller('example')
@ApiTags('Example')
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  @Post()
  @ResponseDTO(ExampleResponseDTO)
  async create(@Body() dto: CreateExampleDTO): Promise<Example> {
    return this.service.create(dto)
  }

  @Get()
  @QueryFilter()
  async findAll(
    @GetContext() context: any,
  ): Promise<PaginatedResponse<Example>> {
    return this.service.findAll(context)
  }
}
```

## 📊 Database Operations

### Mongoose Schema Example

```typescript
@Schema({
  timestamps: COLLECTION_TIMESTAMPS,
  collection: 'examples',
})
export class Example {
  @Prop({ required: true })
  name: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId

  @Prop({
    type: String,
    enum: ExampleStatus,
    default: ExampleStatus.ACTIVE,
  })
  status: ExampleStatus
}
```

### Common Database Queries

```typescript
// Find with pagination
const results = await this.model
  .find(filter)
  .sort({ created_at: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('user', 'first_name last_name');

// Find with aggregation
const results = await this.model.aggregate([
  { $match: filter },
  { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
  { $unwind: '$user' },
  { $sort: { created_at: -1 } },
  { $skip: (page - 1) * limit },
  { $limit: limit },
]);

// Update with validation
const result = await this.model.findByIdAndUpdate(
  id,
  { $set: updateData },
  { new: true, runValidators: true }
);
```

## 🔄 Queue Development

### Queue Processor Pattern

```typescript
@Processor('queue-name')
export class QueueProcessor {
  constructor(
    private readonly service: ExampleService,
    private readonly logger: Logger,
  ) {}

  @Process('job-name')
  async processJob(job: Job<JobData>): Promise<void> {
    try {
      this.logger.log(`Processing job ${job.id}`)

      // Process the job
      const result = await this.service.process(job.data)

      this.logger.log(`Job ${job.id} completed successfully`)
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error)
      throw error
    }
  }
}
```

### Adding Jobs to Queue

```typescript
// Add job to queue
await this.queue.add(
  'job-name',
  {
    project_id: 'project-id',
    data: 'job-data',
  },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
)

// Add delayed job
await this.queue.add('job-name', data, {
  delay: 60000, // 1 minute delay
})
```

## 🔐 Authentication & Authorization

### JWT Authentication

```typescript
// Generate JWT token
const token = this.jwtService.sign({
  sub: user._id,
  email: user.email,
  role: user.role,
})

// Verify JWT token
const payload = this.jwtService.verify(token)
```

### Role-based Authorization

```typescript
// Controller level
@Controller('admin')
@AllowedRoles(UserRole.ADMIN)
export class AdminController {}

// Method level
@Post()
@AllowedRoles(UserRole.ADMIN, UserRole.MODERATOR)
async adminMethod() {}
```

### Custom Guards

```typescript
@Injectable()
export class CustomGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    // Custom logic
    return true
  }
}
```

## 📝 API Development

### DTO Validation

```typescript
export class CreateExampleDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  description?: string
}
```

### Response Transformation

```typescript
export class ExampleResponseDTO {
  @Expose()
  @Transform(transform_object_id())
  _id: string

  @Expose()
  name: string

  @Expose()
  @Type(() => UserResponseDTO)
  user: UserResponseDTO
}
```

### Error Handling

```typescript
// Custom error
throw new BadRequestError('Invalid input data');

// Service error handling
try {
  return await this.service.method();
} catch (error) {
  if (error instanceof NotFoundError) {
    throw new NotFoundError('Resource not found');
  }
  throw error;
}
```

## 🧪 Testing

### Unit Test Example

```typescript
describe('ExampleService', () => {
  let service: ExampleService
  let model: Model<Example>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: getModelToken(Example.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<ExampleService>(ExampleService)
    model = module.get<Model<Example>>(getModelToken(Example.name))
  })

  it('should create an example', async () => {
    const dto = { name: 'Test', email: 'test@example.com' }
    const expected = { _id: 'id', ...dto }

    jest.spyOn(model, 'create').mockResolvedValue(expected as any)

    const result = await service.create(dto)
    expect(result).toEqual(expected)
  })
})
```

### E2E Test Example

```typescript
describe('ExampleController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/example (POST)', () => {
    return request(app.getHttpServer())
      .post('/example')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.name).toBe('Test')
      })
  })
})
```

## 🔧 Configuration

### Environment Variables

```typescript
// Configuration service
@Injectable()
export class ConfigService {
  get databaseUri(): string {
    return process.env.DATABASE_URI
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET
  }
}
```

### Feature Flags

```typescript
// Feature flag service
@Injectable()
export class FeatureFlagService {
  isFeatureEnabled(feature: string): boolean {
    return process.env[`FEATURE_${feature.toUpperCase()}`] === 'true'
  }
}
```

## 📊 Logging

### Structured Logging

```typescript
@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name)

  async method(): Promise<void> {
    this.logger.log('Starting method execution')

    try {
      // Business logic
      this.logger.log('Method completed successfully')
    } catch (error) {
      this.logger.error('Method failed', error.stack)
      throw error
    }
  }
}
```

### Request Logging

```typescript
// Middleware for request logging
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: Function) {
    const { method, url } = req
    const startTime = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - startTime
      this.logger.log(`${method} ${url} ${res.statusCode} - ${duration}ms`)
    })

    next()
  }
}
```

## 🚀 Performance Optimization

### Database Optimization

```typescript
// Use indexes
@Schema({ indexes: [{ user: 1, status: 1 }] })

// Use projection
const users = await this.model.find({}, 'first_name last_name email');

// Use aggregation for complex queries
const stats = await this.model.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

### Caching

```typescript
// Redis caching
@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)
    return value ? JSON.parse(value) : null
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl || 3600)
  }
}
```

## 🔍 Debugging

### Debug Mode

```bash
# Start in debug mode
yarn start:debug

# Attach debugger in VS Code
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "attach",
  "name": "Attach to NestJS",
  "port": 9229,
  "restart": true,
  "stopOnEntry": false,
  "protocol": "inspector"
}
```

### Queue Debugging

```bash
# Monitor queue dashboard
# Access at http://localhost:3210/admin/queues

# Check queue logs
docker-compose logs queue

# Check Redis
docker exec -it redis redis-cli
```

## 📚 Useful Resources

### Documentation Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Bull Queue Documentation](https://docs.bullmq.io/)
- [Swagger Documentation](https://swagger.io/docs/)

### Development Tools

- **API Testing**: Postman, Insomnia
- **Database GUI**: MongoDB Compass, Studio 3T
- **Redis GUI**: RedisInsight
- **Queue Monitoring**: Bull Dashboard

### Code Quality Tools

- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Testing**: Jest

## 🆘 Common Issues & Solutions

### Database Connection Issues

```bash
# Check MongoDB connection
mongo mongodb://localhost:27017/clipspin

# Check connection string
echo $DATABASE_URI

# Restart MongoDB
docker-compose restart mongodb
```

### Queue Processing Issues

```bash
# Check Redis connection
docker exec -it redis redis-cli ping

# Check queue status
curl http://localhost:3210/queue/health

# Restart queue processor
docker-compose restart queue
```

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules
yarn install

# Clear Docker cache
docker system prune -a

# Rebuild containers
docker-compose build --no-cache
```

### Port Conflicts

```bash
# Check port usage
lsof -i :3000
lsof -i :6379

# Kill process using port
kill -9 <PID>
```

## 📋 Development Checklist

### Before Starting Work

- [ ] Pull latest changes from main branch
- [ ] Install/update dependencies
- [ ] Check environment configuration
- [ ] Start required services (MongoDB, Redis)
- [ ] Run tests to ensure everything works

### Before Committing

- [ ] Run linting: `yarn lint`
- [ ] Run formatting: `yarn format`
- [ ] Run tests: `yarn test`
- [ ] Check for TypeScript errors: `yarn build`
- [ ] Update documentation if needed

### Before Creating PR

- [ ] All tests pass
- [ ] Code is properly formatted
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Changes tested locally
- [ ] PR description is clear and complete

## 🤝 Contributing Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Git Workflow

1. Create feature branch from main
2. Make changes and commit
3. Push branch and create PR
4. Request code review
5. Address feedback
6. Merge after approval

### Commit Message Format

```
type(scope): description

feat(auth): add Google OAuth support
fix(projects): resolve credit deduction issue
docs(api): update endpoint documentation
```

## 📞 Getting Help

### Internal Resources

- **API Documentation**: `http://localhost:3210/api/docs`
- **Queue Dashboard**: `http://localhost:3210/admin/queues`
- **Project Documentation**: `docs/` directory

### Team Communication

- **Lead Developer**: @nurikjohn
- **Slack Channel**: #clipspin-dev
- **Issue Tracker**: GitHub Issues

### External Resources

- **Stack Overflow**: Tag with `nestjs`, `mongoose`, `bull-queue`
- **GitHub Discussions**: Project repository
- **Community Forums**: NestJS Discord, MongoDB Community
