# Database Schema Documentation

## 🗄️ Overview

ClipSpin uses **MongoDB** as the primary database with **Mongoose ODM** for schema management. The database is designed to handle video generation projects, user management, subscriptions, and AI service integrations.

## 📊 Collections

### 1. Users Collection (`users`)

**Purpose**: Store user authentication and profile information.

**Schema**:

```typescript
{
  _id: ObjectId,
  email: String (required, unique),
  password: String (hashed),
  first_name: String,
  last_name: String,
  phone: String,
  role: String (enum: ['user', 'admin'], default: 'user'),
  is_verified: Boolean (default: false),
  verification_token: String,
  reset_password_token: String,
  reset_password_expires: Date,
  google_id: String,
  avatar_url: String,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:

- `email` (unique)
- `google_id` (sparse)
- `verification_token`
- `reset_password_token`

**Relationships**:

- One-to-Many with `projects`
- One-to-One with `user_subscriptions`

### 2. Projects Collection (`projects`)

**Purpose**: Store video generation project data and metadata.

**Schema**:

```typescript
{
  _id: ObjectId,
  title: String (required),
  type: String (enum: ['slide_show', 'text_audiogram', 'talking_head', 'veo3', 'professional']),

  // Input data
  input: {
    url: String (required),
    source: String (enum: ['youtube', 'instagram', 'tiktok'])
  },

  // AI-generated content
  suggested_ideas: [{
    title: String,
    script: String,
    description: String
  }],
  selected_idea: {
    title: String,
    script: String,
    description: String
  },

  // Project-specific data
  slide_show_data: {
    slides: [{
      title: String,
      content: String,
      image_url: String,
      duration: Number
    }],
    background_music: String,
    transition_effects: [String]
  },

  text_audiogram_data: {
    text: String,
    voice_id: String,
    background_music: String,
    visual_style: String
  },

  talking_head_data: {
    avatar_id: String,
    voice_id: String,
    script: String,
    background: String
  },

  veo3_data: {
    title: String,
    script: String,
    style: String,
    duration: Number
  },

  // Metadata
  hashtags: String,
  optimized_copy: String,
  user: ObjectId (ref: 'User'),
  avatar: ObjectId (ref: 'HeygenAvatar'),

  // Status tracking
  status: String (enum: ['queued', 'in_progress', 'cancelled', 'failed', 'completed']),
  progress: String (enum: [
    'fetching_input', 'input_fetched',
    'analyzing_input', 'input_analyzed',
    'generating_script', 'script_generated',
    'generating_images', 'images_generated',
    'generating_veo3', 'veo3_generated',
    'generating_video', 'video_generated',
    'saving_results', 'results_saved'
  ]),

  // Credit tracking
  credit_usage: {
    total: Number,
    monthly: Number,
    purchased: Number
  },

  // Output
  output: {
    file_key: String,
    video_id: String,
    duration: Number,
    size: Number,
    url: String
  },

  error_cause: String,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:

- `user` (for user's projects)
- `status` (for filtering)
- `type` (for filtering)
- `created_at` (for sorting)
- `status + created_at` (compound)

**Relationships**:

- Many-to-One with `users`
- Many-to-One with `heygen_avatars`

### 3. Subscription Plans Collection (`subscription_plans`)

**Purpose**: Define available subscription plans and pricing.

**Schema**:

```typescript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  price: Number (required),
  credits: Number (required),
  project_type_prices: [{
    type: String (enum: ['slide_show', 'text_audiogram', 'talking_head', 'veo3', 'professional']),
    credit_cost: Number (required)
  }],
  stripe_price_id: String,
  is_active: Boolean (default: true),
  features: [String],
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:

- `is_active`
- `stripe_price_id`

### 4. User Subscriptions Collection (`user_subscriptions`)

**Purpose**: Track user subscription status and credit balance.

**Schema**:

```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  plan: ObjectId (ref: 'SubscriptionPlan', required),
  status: String (enum: ['active', 'cancelled', 'expired', 'pending']),
  credits: Number (default: 0),
  credits_used: Number (default: 0),
  credits_purchased: Number (default: 0),
  stripe_subscription_id: String,
  stripe_customer_id: String,
  current_period_start: Date,
  current_period_end: Date,
  cancelled_at: Date,
  expires_at: Date,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:

- `user` (unique, sparse)
- `status`
- `stripe_subscription_id`
- `expires_at`

**Relationships**:

- One-to-One with `users`
- Many-to-One with `subscription_plans`

### 5. Credit Packs Collection (`credit_packs`)

**Purpose**: Define one-time credit purchase options.

**Schema**:

```typescript
{
  _id: ObjectId,
  name: String (required),
  credits: Number (required),
  price: Number (required),
  stripe_price_id: String,
  is_active: Boolean (default: true),
  description: String,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:

- `is_active`
- `stripe_price_id`

### 6. HeyGen Avatars Collection (`heygen_avatars`)

**Purpose**: Store available AI avatars for talking head videos.

**Schema**:

```typescript
{
  _id: ObjectId,
  name: String (required),
  avatar_id: String (required, unique),
  gender: String (enum: ['male', 'female']),
  age: String (enum: ['18-25', '25-35', '35-45', '45+']),
  ethnicity: String,
  language: String,
  preview_url: String,
  is_active: Boolean (default: true),
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:

- `avatar_id` (unique)
- `is_active`
- `gender + age` (compound)

### 7. HeyGen Voices Collection (`heygen_voices`)

**Purpose**: Store available AI voices for text-to-speech.

**Schema**:

```typescript
{
  _id: ObjectId,
  name: String (required),
  voice_id: String (required, unique),
  language: String (required),
  gender: String (enum: ['male', 'female']),
  accent: String,
  preview_url: String,
  is_active: Boolean (default: true),
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:

- `voice_id` (unique)
- `is_active`
- `language + gender` (compound)

### 8. OTP Collection (`otps`)

**Purpose**: Store one-time passwords for email verification and password reset.

**Schema**:

```typescript
{
  _id: ObjectId,
  email: String (required),
  otp: String (required),
  type: String (enum: ['verification', 'password_reset']),
  expires_at: Date (required),
  is_used: Boolean (default: false),
  created_at: Date
}
```

**Indexes**:

- `email + type` (compound)
- `expires_at` (TTL index)

### 9. Password Reset Collection (`password_resets`)

**Purpose**: Track password reset requests.

**Schema**:

```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  token: String (required, unique),
  expires_at: Date (required),
  is_used: Boolean (default: false),
  created_at: Date
}
```

**Indexes**:

- `token` (unique)
- `expires_at` (TTL index)
- `user`

## 🔗 Relationships Diagram

```
Users (1) ←→ (1) UserSubscriptions (N) ←→ (1) SubscriptionPlans
  ↓
  (1) ←→ (N) Projects (N) ←→ (1) HeyGenAvatars
  ↓
  (1) ←→ (N) PasswordResets
  ↓
  (1) ←→ (N) OTPs
```

## 📈 Data Flow

### 1. User Registration Flow

```
User Registration → Create User → Send Verification Email → Verify Email → Activate Account
```

### 2. Project Creation Flow

```
Create Project → Check Credits → Deduct Credits → Queue Processing → Update Status
```

### 3. Subscription Flow

```
Select Plan → Stripe Payment → Create Subscription → Allocate Credits → Activate Features
```

## 🔍 Query Examples

### Get User Projects with Pagination

```javascript
const projects = await Project.find({ user: userId })
  .sort({ created_at: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('avatar', 'name preview_url')
```

### Get User Subscription with Plan Details

```javascript
const subscription = await UserSubscription.findOne({ user: userId }).populate(
  'plan',
  'name price credits project_type_prices',
)
```

### Get Active Avatars by Gender and Age

```javascript
const avatars = await HeygenAvatar.find({
  is_active: true,
  gender: 'female',
  age: '25-35',
}).sort({ name: 1 })
```

### Get Projects by Status with User Info

```javascript
const projects = await Project.find({ status: 'completed' })
  .populate('user', 'first_name last_name email')
  .populate('avatar', 'name')
```

## 🛡️ Data Validation

### Mongoose Schema Validation

- **Required Fields**: Email, password, project title, etc.
- **Enum Validation**: Status, type, role fields
- **Unique Constraints**: Email, avatar_id, voice_id
- **Reference Validation**: User, plan, avatar references

### Business Logic Validation

- **Credit Check**: Ensure user has sufficient credits before project creation
- **Status Transitions**: Validate project status changes
- **Subscription Status**: Check subscription validity before operations

## 🔄 Data Migration

### Version Control

- Schema changes are versioned
- Migration scripts for data structure updates
- Backward compatibility maintained

### Common Migrations

```javascript
// Example: Add new field to projects
db.projects.updateMany({}, { $set: { new_field: 'default_value' } })

// Example: Update existing data
db.projects.updateMany(
  { status: 'old_status' },
  { $set: { status: 'new_status' } },
)
```

## 📊 Performance Optimization

### Indexing Strategy

- **Primary Keys**: All collections have `_id` index
- **Foreign Keys**: Index on reference fields
- **Query Fields**: Index on frequently queried fields
- **Compound Indexes**: For complex queries
- **TTL Indexes**: For temporary data (OTPs, password resets)

### Query Optimization

- **Projection**: Select only needed fields
- **Population**: Use populate for related data
- **Aggregation**: Use aggregation pipeline for complex queries
- **Pagination**: Implement proper pagination

### Monitoring

- **Query Performance**: Monitor slow queries
- **Index Usage**: Track index effectiveness
- **Connection Pool**: Monitor database connections
- **Storage**: Track collection sizes and growth

## 🔐 Security Considerations

### Data Protection

- **Password Hashing**: Bcrypt for password storage
- **Sensitive Data**: Encrypt sensitive fields
- **Access Control**: Role-based access to data
- **Audit Trail**: Track data modifications

### Backup Strategy

- **Regular Backups**: Daily automated backups
- **Point-in-Time Recovery**: Enable oplog for recovery
- **Offsite Storage**: Store backups in multiple locations
- **Testing**: Regular backup restoration tests

## 📝 Schema Evolution

### Adding New Fields

1. Update Mongoose schema
2. Create migration script
3. Test with sample data
4. Deploy to staging
5. Deploy to production

### Breaking Changes

1. Create new schema version
2. Implement data migration
3. Update application code
4. Deploy with feature flags
5. Monitor for issues

### Versioning Strategy

- **Major Changes**: New collection or major restructuring
- **Minor Changes**: Adding optional fields
- **Patch Changes**: Bug fixes and optimizations
