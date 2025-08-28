# Queue System Documentation

## 🔄 Overview

ClipSpin uses a **Bull Queue** system with **Redis** to handle asynchronous video generation workflows. The queue system is designed to process video generation tasks in a scalable and fault-tolerant manner.

## 🏗️ Architecture

### Queue Structure

```
Main Queue (Orchestrator)
    ↓
Input Video Parser Queue
    ↓
Analyze Video Queue
    ↓
Content Generator Queue
    ↓
Specific Generator Queues:
├── Slide Show Generator
├── Text Audiogram Generator
├── Talking Head Generator
├── Veo3 Generator
    ↓
Output Queue
```

## 📋 Queue Processors

### 1. Main Queue Processor (`main-queue`)

**Purpose**: Orchestrates the entire video generation workflow.

**Location**: `apps/queue/src/queus/main-queue/`

**Responsibilities**:

- Initialize project processing
- Coordinate between different queue processors
- Handle workflow state management
- Manage error handling and retries
- Update project status and progress

**Job Data Structure**:

```typescript
interface MainQueueJob {
  project_id: string
  user_id: string
  project_type: ProjectType
  input_url: string
  avatar_id?: string
  voice_id?: string
}
```

**Processing Steps**:

1. **Validation**: Validate project data and user permissions
2. **Credit Check**: Verify user has sufficient credits
3. **Queue Input Parser**: Send job to input parser queue
4. **Monitor Progress**: Track processing status
5. **Handle Completion**: Finalize project and update status

### 2. Input Video Parser Queue (`input-video-parser`)

**Purpose**: Extract content from input URLs (YouTube, Instagram, TikTok).

**Location**: `apps/queue/src/queus/input-video-parser/`

**Responsibilities**:

- Parse input URLs and extract metadata
- Download video/audio content
- Extract text content from social media posts
- Validate input content
- Store extracted data

**Job Data Structure**:

```typescript
interface InputParserJob {
  project_id: string
  input_url: string
  source: 'youtube' | 'instagram' | 'tiktok'
}
```

**Processing Steps**:

1. **URL Validation**: Validate input URL format
2. **Content Extraction**: Extract content based on source type
3. **Metadata Collection**: Gather title, description, duration, etc.
4. **Content Storage**: Store extracted content in R2
5. **Update Project**: Update project with extracted data

### 3. Analyze Video Queue (`analyze-video`)

**Purpose**: Analyze video content and generate insights.

**Location**: `apps/queue/src/queus/analyze-video/`

**Responsibilities**:

- Analyze video content using AI
- Extract key topics and themes
- Generate content summaries
- Identify target audience
- Create content recommendations

**Job Data Structure**:

```typescript
interface AnalyzeVideoJob {
  project_id: string
  video_url: string
  extracted_content: string
  metadata: VideoMetadata
}
```

**Processing Steps**:

1. **Content Analysis**: Use OpenAI to analyze content
2. **Topic Extraction**: Identify main topics and themes
3. **Audience Analysis**: Determine target audience
4. **Content Insights**: Generate content insights
5. **Update Project**: Store analysis results

### 4. Content Generator Queue (`content-generator`)

**Purpose**: Generate scripts and content ideas based on analysis.

**Location**: `apps/queue/src/queus/content-generator/`

**Responsibilities**:

- Generate multiple content ideas
- Create engaging scripts
- Optimize content for different platforms
- Generate hashtags and descriptions
- Create SEO-optimized content

**Job Data Structure**:

```typescript
interface ContentGeneratorJob {
  project_id: string
  analysis_results: AnalysisResults
  project_type: ProjectType
  target_audience: string
}
```

**Processing Steps**:

1. **Idea Generation**: Generate multiple content ideas
2. **Script Creation**: Create engaging scripts
3. **Content Optimization**: Optimize for target platform
4. **Hashtag Generation**: Generate relevant hashtags
5. **Update Project**: Store generated content

### 5. Slide Show Generator Queue (`slide-show-generator`)

**Purpose**: Create slide show videos from content.

**Location**: `apps/queue/src/queus/slide-show-generator/`

**Responsibilities**:

- Generate slides from content
- Create visual assets
- Add background music
- Apply transitions and effects
- Render final video

**Job Data Structure**:

```typescript
interface SlideShowJob {
  project_id: string
  script: string
  content_ideas: ContentIdea[]
  visual_style: string
  background_music?: string
}
```

**Processing Steps**:

1. **Slide Generation**: Create slides from script
2. **Image Generation**: Generate images for slides
3. **Audio Processing**: Add background music
4. **Video Rendering**: Render final video
5. **Quality Check**: Verify video quality

### 6. Text Audiogram Generator Queue (`text-audiogram-generator`)

**Purpose**: Create text-to-speech videos.

**Location**: `apps/queue/src/queus/text-audiogram-generator/`

**Responsibilities**:

- Convert text to speech
- Generate visual elements
- Add background music
- Create engaging visuals
- Render final video

**Job Data Structure**:

```typescript
interface TextAudiogramJob {
  project_id: string
  text: string
  voice_id: string
  visual_style: string
  background_music?: string
}
```

**Processing Steps**:

1. **Text Processing**: Process and optimize text
2. **Speech Synthesis**: Convert text to speech
3. **Visual Generation**: Create visual elements
4. **Audio Mixing**: Mix speech with background music
5. **Video Rendering**: Render final video

### 7. Talking Head Generator Queue (`talking-head-generator`)

**Purpose**: Create AI avatar videos.

**Location**: `apps/queue/src/queus/talking-head-generator/`

**Responsibilities**:

- Generate AI avatar videos
- Sync audio with avatar movements
- Add background elements
- Apply visual effects
- Render final video

**Job Data Structure**:

```typescript
interface TalkingHeadJob {
  project_id: string
  script: string
  avatar_id: string
  voice_id: string
  background?: string
}
```

**Processing Steps**:

1. **Script Processing**: Process and optimize script
2. **Avatar Generation**: Generate avatar video
3. **Audio Sync**: Sync audio with avatar
4. **Background Addition**: Add background elements
5. **Video Rendering**: Render final video

### 8. Veo3 Generator Queue (`veo3-generator`)

**Purpose**: Create advanced AI-generated videos.

**Location**: `apps/queue/src/queus/veo3-generator/`

**Responsibilities**:

- Generate advanced AI videos
- Apply sophisticated effects
- Create high-quality content
- Optimize for performance
- Render final video

**Job Data Structure**:

```typescript
interface Veo3Job {
  project_id: string
  script: string
  style: string
  duration: number
  effects: string[]
}
```

**Processing Steps**:

1. **Content Processing**: Process script and style
2. **AI Generation**: Generate video using AI
3. **Effect Application**: Apply visual effects
4. **Quality Enhancement**: Enhance video quality
5. **Final Rendering**: Render final video

### 9. Output Queue (`output`)

**Purpose**: Handle final video processing and storage.

**Location**: `apps/queue/src/queus/output/`

**Responsibilities**:

- Process final video files
- Upload to cloud storage
- Generate download links
- Update project status
- Send completion notifications

**Job Data Structure**:

```typescript
interface OutputJob {
  project_id: string
  video_file: string
  metadata: VideoMetadata
  user_id: string
}
```

**Processing Steps**:

1. **File Processing**: Process video file
2. **Cloud Upload**: Upload to R2 storage
3. **Link Generation**: Generate download links
4. **Status Update**: Update project status
5. **Notification**: Send completion notification

## 🔧 Queue Configuration

### Redis Configuration

```typescript
// Queue configuration
const queueConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
}
```

### Queue Options

```typescript
// Queue-specific options
const queueOptions = {
  // Concurrency control
  concurrency: 5,

  // Job processing options
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },

  // Job cleanup
  removeOnComplete: 100,
  removeOnFail: 50,

  // Rate limiting
  limiter: {
    max: 10,
    duration: 1000,
  },
}
```

## 📊 Job States and Lifecycle

### Job States

1. **Waiting**: Job is queued and waiting to be processed
2. **Active**: Job is currently being processed
3. **Completed**: Job completed successfully
4. **Failed**: Job failed after all retry attempts
5. **Delayed**: Job is scheduled for future processing
6. **Paused**: Job processing is paused

### Job Lifecycle

```
Job Created → Waiting → Active → Completed/Failed
     ↓           ↓        ↓           ↓
   Validation  Queue   Processing   Cleanup
```

## 🔄 Workflow Orchestration

### Main Workflow

```typescript
// Main queue processor workflow
async processMainQueue(job: Job<MainQueueJob>) {
  const { project_id, user_id, project_type, input_url } = job.data;

  try {
    // 1. Validate project
    await this.validateProject(project_id, user_id);

    // 2. Check credits
    await this.checkCredits(user_id, project_type);

    // 3. Update status to in_progress
    await this.updateProjectStatus(project_id, 'in_progress');

    // 4. Queue input parser
    await this.inputParserQueue.add('parse-input', {
      project_id,
      input_url,
      source: this.detectSource(input_url),
    });

    // 5. Monitor progress
    await this.monitorProgress(project_id);

  } catch (error) {
    await this.handleError(project_id, error);
  }
}
```

### Error Handling

```typescript
// Error handling strategy
async handleError(project_id: string, error: Error) {
  // 1. Log error
  this.logger.error(`Project ${project_id} failed:`, error);

  // 2. Update project status
  await this.projectService.failed(project_id, error.message);

  // 3. Return credits
  await this.returnCredits(project_id);

  // 4. Send notification
  await this.sendFailureNotification(project_id, error.message);
}
```

## 📈 Monitoring and Observability

### Queue Metrics

- **Job Count**: Number of jobs in each state
- **Processing Time**: Average time to process jobs
- **Failure Rate**: Percentage of failed jobs
- **Throughput**: Jobs processed per minute
- **Queue Length**: Number of waiting jobs

### Health Checks

```typescript
// Queue health check
async checkQueueHealth() {
  const queues = [
    this.mainQueue,
    this.inputParserQueue,
    this.analyzeVideoQueue,
    // ... other queues
  ];

  for (const queue of queues) {
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const failed = await queue.getFailed();

    if (waiting.length > 1000 || failed.length > 100) {
      this.logger.warn(`Queue ${queue.name} needs attention`);
    }
  }
}
```

### Dashboard

Access queue monitoring dashboard at:

- **URL**: `http://localhost:3210/admin/queues`
- **Features**: Real-time queue monitoring, job details, retry management

## 🔧 Development and Testing

### Local Development

```bash
# Start Redis
docker-compose up redis

# Start queue processor
cd apps/queue && npm run start:dev

# Monitor queues
# Access Bull dashboard at http://localhost:3210/admin/queues
```

### Testing Queues

```typescript
// Test queue processor
describe('MainQueueProcessor', () => {
  it('should process project successfully', async () => {
    const job = {
      data: {
        project_id: 'test-project-id',
        user_id: 'test-user-id',
        project_type: 'slide_show',
        input_url: 'https://youtube.com/watch?v=test',
      },
    }

    await processor.process(job)

    // Assert project status updated
    const project = await projectService.findById('test-project-id')
    expect(project.status).toBe('completed')
  })
})
```

### Mocking External Services

```typescript
// Mock AI services for testing
jest.mock('../services/openai.service', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    analyzeContent: jest.fn().mockResolvedValue({
      topics: ['technology', 'innovation'],
      summary: 'Test summary',
    }),
  })),
}))
```

## 🚀 Performance Optimization

### Concurrency Control

```typescript
// Optimize concurrency based on queue type
const concurrencyConfig = {
  'main-queue': 1, // Sequential processing
  'input-parser': 3, // Parallel URL parsing
  'analyze-video': 2, // AI analysis (rate limited)
  'content-generator': 5, // Content generation
  'slide-show': 2, // Video rendering
  output: 3, // File processing
}
```

### Memory Management

```typescript
// Clean up completed jobs
const cleanupConfig = {
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 50, // Keep last 50 failed jobs
  attempts: 3, // Retry failed jobs 3 times
}
```

### Rate Limiting

```typescript
// Rate limit external API calls
const rateLimitConfig = {
  openai: { max: 10, duration: 60000 }, // 10 requests per minute
  heygen: { max: 5, duration: 60000 }, // 5 requests per minute
  'fal-ai': { max: 20, duration: 60000 }, // 20 requests per minute
}
```

## 🔐 Security Considerations

### Job Data Security

- **Sensitive Data**: Never log sensitive information in job data
- **Data Encryption**: Encrypt sensitive job data
- **Access Control**: Validate user permissions for each job
- **Input Validation**: Validate all job input data

### Queue Security

- **Redis Security**: Secure Redis connection with authentication
- **Network Security**: Use VPN or private network for queue communication
- **Monitoring**: Monitor for suspicious queue activity
- **Backup**: Regular backup of queue data

## 📝 Best Practices

### Job Design

1. **Idempotency**: Jobs should be idempotent (safe to retry)
2. **Error Handling**: Always handle errors gracefully
3. **Logging**: Log important events and errors
4. **Monitoring**: Monitor job performance and failures
5. **Testing**: Test queue processors thoroughly

### Queue Management

1. **Concurrency**: Set appropriate concurrency limits
2. **Retry Strategy**: Implement exponential backoff for retries
3. **Cleanup**: Regularly clean up old jobs
4. **Monitoring**: Monitor queue health and performance
5. **Scaling**: Scale queues based on load

### Development Workflow

1. **Local Testing**: Test queues locally before deployment
2. **Staging Environment**: Test in staging environment
3. **Gradual Rollout**: Roll out changes gradually
4. **Monitoring**: Monitor production queues closely
5. **Documentation**: Keep queue documentation updated
