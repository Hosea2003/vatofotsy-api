# Polling System - API Reference

## Overview
A comprehensive polling system that supports public and private polls with customizable result display settings and media attachments.

## Poll Types & Features

### Poll Visibility Types
- **PUBLIC**: Anyone on the platform can vote
- **PRIVATE**: Only organization members can vote (requires organizationId)

### Result Display Types
- **OPEN**: Users can see results even before voting ends
- **CLOSED**: Results only visible after voting ends

### Poll Statuses
- **DRAFT**: Poll created but not yet active
- **ACTIVE**: Poll is live and accepting votes
- **ENDED**: Voting period has expired
- **CANCELLED**: Poll was cancelled by creator

### Media Support
- **Images**: JPG, PNG, GIF
- **Videos**: MP4, WebM
- **Documents**: PDF, DOC, etc.

## API Endpoints

### 1. Create Poll
```http
POST /polls
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "What's your favorite programming language?",
  "description": "Help us choose the tech stack for our next project",
  "type": "PUBLIC", // or "PRIVATE"
  "resultDisplayType": "CLOSED", // or "OPEN"
  "votingEndsAt": "2023-12-31T23:59:59Z",
  "organizationId": "org-uuid", // required for PRIVATE polls
  "allowMultipleChoices": false,
  "choices": [
    {
      "name": "JavaScript",
      "description": "Dynamic and versatile language",
      "mediaUrl": "https://example.com/js-logo.png",
      "mediaType": "IMAGE",
      "mediaFileName": "javascript-logo.png"
    },
    {
      "name": "Python", 
      "description": "Simple and powerful",
      "mediaUrl": null
    },
    {
      "name": "Go",
      "description": "Fast and efficient"
    }
  ]
}
```

**Response:** Poll created in DRAFT status

### 2. Activate Poll (Make Live)
```http
PUT /polls/:id/activate
Authorization: Bearer <token>
```

**Requirements:** Only poll creator can activate
**Result:** Poll status changes to ACTIVE

### 3. Get Public Polls
```http
GET /polls/public
```

**Returns:** All public active polls

### 4. Get My Polls
```http
GET /polls/my-polls
Authorization: Bearer <token>
```

**Returns:** All polls created by current user

### 5. Get Poll by ID
```http
GET /polls/:id
Authorization: Bearer <token> (optional for public polls)
```

**Returns:** Poll details with choices

### 6. Delete Poll
```http
DELETE /polls/:id
Authorization: Bearer <token>
```

**Requirements:** Only poll creator can delete

## Poll Workflow

### 1. Creating & Publishing Flow
```
1. Create Poll (DRAFT status)
   ↓
2. Review & Edit (optional)
   ↓ 
3. Activate Poll (ACTIVE status)
   ↓
4. Users Vote
   ↓
5. Voting Ends (ENDED status)
```

### 2. Permission Matrix

| Action | Creator | Org Members | Public Users |
|--------|---------|-------------|--------------|
| Create Poll | ✅ | ✅ | ✅ |
| View Public Poll | ✅ | ✅ | ✅ |
| View Private Poll | ✅ | ✅ | ❌ |
| Vote Public | ✅ | ✅ | ✅ |
| Vote Private | ✅ (if member) | ✅ | ❌ |
| View Open Results | ✅ | ✅ | ✅ |
| View Closed Results | ✅ (always) | ✅ (after end) | ✅ (after end) |
| Edit Poll | ✅ (draft only) | ❌ | ❌ |
| Delete Poll | ✅ | ❌ | ❌ |

## Response Examples

### Poll Response
```json
{
  "id": "poll-uuid",
  "title": "What's your favorite programming language?",
  "description": "Help us choose the tech stack",
  "createdBy": "user-uuid",
  "organizationId": null,
  "type": "PUBLIC",
  "resultDisplayType": "CLOSED", 
  "status": "ACTIVE",
  "votingEndsAt": "2023-12-31T23:59:59Z",
  "allowMultipleChoices": false,
  "isActive": true,
  "isVotingActive": true,
  "isVotingEnded": false,
  "canViewResults": false,
  "choices": [
    {
      "id": "choice-uuid-1",
      "name": "JavaScript",
      "description": "Dynamic and versatile",
      "mediaUrl": "https://example.com/js-logo.png",
      "mediaType": "IMAGE",
      "mediaFileName": "javascript-logo.png",
      "voteCount": 42,
      "createdAt": "2023-01-01T00:00:00Z"
    },
    {
      "id": "choice-uuid-2", 
      "name": "Python",
      "description": "Simple and powerful",
      "mediaUrl": null,
      "mediaType": null,
      "mediaFileName": null,
      "voteCount": 38,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z",
  "creator": {
    "id": "user-uuid",
    "email": "creator@example.com", 
    "firstName": "John",
    "lastName": "Doe"
  },
  "organization": null
}
```

## Business Rules

### Poll Creation
1. Must have at least 2 choices
2. Voting end time must be in the future
3. Private polls require organization ID
4. Creator automatically has viewing permissions

### Poll Activation
1. Only DRAFT polls can be activated
2. Only creator can activate
3. Voting end time must still be in future

### Result Visibility
1. **OPEN polls**: Results visible immediately to all viewers
2. **CLOSED polls**: Results only visible after voting ends
3. **Exception**: Poll creators can always see results

### Media Files
1. Files stored with unique UUIDs
2. Automatic cleanup when poll is deleted
3. Local storage for now (S3-compatible in future)

## Error Responses

```json
{
  "statusCode": 400,
  "message": "A poll must have at least 2 choices",
  "error": "Bad Request"
}
```

## Future Enhancements (Not Yet Implemented)

### Voting System
- Cast votes on polls
- Multiple choice support
- Vote validation and constraints
- Real-time vote counting

### Advanced Features
- Poll templates
- Recurring polls  
- Poll analytics and insights
- Comment system
- Poll sharing and embedding

### File Upload
- S3-compatible storage integration
- Image/video processing and thumbnails
- File size and type validation
- CDN integration for media delivery

### Real-time Features
- Live vote updates via WebSocket
- Real-time result charts
- Push notifications for poll events

## Technical Notes

### File Storage
Currently using local file storage at `/uploads/poll-media/`. 
For production, integrate with:
- AWS S3
- MinIO (self-hosted S3-compatible)
- Cloudinary
- Google Cloud Storage

### Database Schema
- `polls` table: Core poll data
- `poll_choices` table: Poll options with media
- `poll_votes` table: User votes (to be implemented)
- Foreign key relationships with users and organizations

### Security
- JWT authentication required for most operations
- Organization membership validation for private polls
- File upload validation and sanitization
- Rate limiting on poll creation
