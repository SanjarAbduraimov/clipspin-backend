# API Endpoints Documentation

## 🔐 Authentication Endpoints

### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/auth/login`

Authenticate user and get access token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/auth/google`

Authenticate with Google OAuth.

**Request Body:**

```json
{
  "token": "google_oauth_token"
}
```

### POST `/api/auth/refresh`

Refresh access token.

**Headers:**

```
Authorization: Bearer <current_token>
```

### POST `/api/auth/logout`

Logout user (invalidate token).

**Headers:**

```
Authorization: Bearer <token>
```

## 👤 User Management Endpoints

### GET `/api/users/profile`

Get current user profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "subscription": {
      "plan": "premium",
      "credits": 100,
      "expires_at": "2024-12-31T23:59:59Z"
    }
  }
}
```

### PUT `/api/users/profile`

Update user profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

## 📁 Project Management Endpoints

### GET `/api/projects`

Get all projects for current user.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (queued, in_progress, completed, failed, cancelled)
- `type`: Filter by project type (slide_show, text_audiogram, talking_head, veo3, professional)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "My First Video",
        "type": "slide_show",
        "status": "completed",
        "progress": "results_saved",
        "input": {
          "url": "https://youtube.com/watch?v=example",
          "source": "youtube"
        },
        "output": {
          "file_key": "videos/507f1f77bcf86cd799439011.mp4",
          "video_id": "video_123"
        },
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### POST `/api/projects`

Create a new project.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "My New Video Project",
  "type": "slide_show",
  "input": {
    "url": "https://youtube.com/watch?v=example"
  },
  "avatar": "507f1f77bcf86cd799439012"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My New Video Project",
    "type": "slide_show",
    "status": "queued",
    "progress": "fetching_input",
    "input": {
      "url": "https://youtube.com/watch?v=example",
      "source": "youtube"
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET `/api/projects/:id`

Get specific project details.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Video Project",
    "type": "slide_show",
    "status": "completed",
    "progress": "results_saved",
    "input": {
      "url": "https://youtube.com/watch?v=example",
      "source": "youtube"
    },
    "suggested_ideas": [
      {
        "title": "Educational Overview",
        "script": "This video provides an educational overview..."
      }
    ],
    "selected_idea": {
      "title": "Educational Overview",
      "script": "This video provides an educational overview..."
    },
    "slide_show_data": {
      "slides": [
        {
          "title": "Introduction",
          "content": "Welcome to our overview...",
          "image_url": "https://example.com/image1.jpg"
        }
      ]
    },
    "output": {
      "file_key": "videos/507f1f77bcf86cd799439011.mp4",
      "video_id": "video_123"
    },
    "credit_usage": {
      "total": 5,
      "monthly": 3,
      "purchased": 2
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
  }
}
```

### PUT `/api/projects/:id`

Update project details.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "Updated Project Title",
  "selected_idea": {
    "title": "New Idea",
    "script": "Updated script content..."
  }
}
```

### DELETE `/api/projects/:id`

Cancel a project.

**Headers:**

```
Authorization: Bearer <token>
```

## 💳 Subscription Management Endpoints

### GET `/api/subscription-plans`

Get available subscription plans.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Starter",
      "description": "Perfect for beginners",
      "price": 9.99,
      "credits": 50,
      "project_type_prices": [
        {
          "type": "slide_show",
          "credit_cost": 1
        },
        {
          "type": "text_audiogram",
          "credit_cost": 2
        }
      ]
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Professional",
      "description": "For content creators",
      "price": 29.99,
      "credits": 200,
      "project_type_prices": [
        {
          "type": "slide_show",
          "credit_cost": 1
        },
        {
          "type": "talking_head",
          "credit_cost": 3
        }
      ]
    }
  ]
}
```

### POST `/api/user-subscriptions`

Create a new subscription.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "plan_id": "507f1f77bcf86cd799439011",
  "payment_method": "stripe"
}
```

### GET `/api/user-subscriptions/current`

Get current user subscription.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "plan": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Professional",
      "price": 29.99
    },
    "credits": 185,
    "status": "active",
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 🎭 Avatar Management Endpoints

### GET `/api/heygen-avatars`

Get available HeyGen avatars.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Sarah",
      "avatar_id": "heygen_avatar_123",
      "gender": "female",
      "age": "25-35",
      "ethnicity": "caucasian",
      "preview_url": "https://example.com/avatar1.jpg"
    }
  ]
}
```

### GET `/api/heygen-voices`

Get available HeyGen voices.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Emma",
      "voice_id": "heygen_voice_123",
      "language": "en",
      "gender": "female",
      "accent": "american",
      "preview_url": "https://example.com/voice1.mp3"
    }
  ]
}
```

## 📁 File Management Endpoints

### POST `/api/files/upload`

Upload a file.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: File to upload
- `type`: File type (image, video, audio)

**Response:**

```json
{
  "success": true,
  "data": {
    "file_key": "uploads/507f1f77bcf86cd799439011.jpg",
    "url": "https://example.com/uploads/507f1f77bcf86cd799439011.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

### GET `/api/files/:file_key`

Get file information.

**Headers:**

```
Authorization: Bearer <token>
```

## 🔧 Credit Pack Endpoints

### GET `/api/credit-packs`

Get available credit packs.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Small Pack",
      "credits": 25,
      "price": 4.99,
      "stripe_price_id": "price_123"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Large Pack",
      "credits": 100,
      "price": 19.99,
      "stripe_price_id": "price_456"
    }
  ]
}
```

### POST `/api/credit-packs/purchase`

Purchase a credit pack.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "pack_id": "507f1f77bcf86cd799439011",
  "payment_method": "stripe"
}
```

## 📊 Error Responses

All endpoints return consistent error responses:

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized access",
    "code": "UNAUTHORIZED"
  }
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions",
    "code": "FORBIDDEN"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "message": "Resource not found",
    "code": "NOT_FOUND"
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
}
```

## 🔗 Webhook Endpoints

### POST `/api/webhooks/stripe`

Stripe webhook for payment processing.

**Headers:**

```
Stripe-Signature: <stripe_signature>
```

### POST `/api/webhooks/heygen`

HeyGen webhook for avatar/voice generation.

## 📝 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Project creation**: 10 requests per hour
- **File uploads**: 20 requests per hour
- **General endpoints**: 100 requests per minute

## 🔐 Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Public endpoints (no authentication required):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/subscription-plans`
- `GET /api/credit-packs`
- Webhook endpoints

## 📋 Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

## 🔍 Filtering and Sorting

Many endpoints support filtering and sorting:

### Filtering

- `status`: Filter by status
- `type`: Filter by type
- `created_at`: Filter by date range
- `user`: Filter by user (admin only)

### Sorting

- `sort_by`: Field to sort by
- `sort_order`: `asc` or `desc`

Example:

```
GET /api/projects?status=completed&sort_by=created_at&sort_order=desc
```
