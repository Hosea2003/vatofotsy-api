# Organization Invitation System - API Reference

## Overview
The invitation system allows organization members to invite users, and users to manage their invitations.

## Member Roles & Permissions
- **OWNER**: Full control (created automatically when organization is created)
- **ADMIN**: Can manage members and invite users
- **MEMBER**: Can invite users (basic member)

## API Endpoints

### 1. Invite User to Organization
```http
POST /organizations/:organizationId/members/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "role": "MEMBER" // or "ADMIN", "OWNER"
}
```

**Requirements:**
- Must be a member of the organization
- Target user cannot already be a member
- Target user cannot have pending invite

### 2. View Organization Members
```http
GET /organizations/:organizationId/members
Authorization: Bearer <token>
```

**Returns:** List of all members with their roles and status

### 3. View My Organizations
```http
GET /users/me/organizations
Authorization: Bearer <token>
```

**Returns:** All organizations where user is an active member

### 4. View My Pending Invitations
```http
GET /users/me/organizations/invites
Authorization: Bearer <token>
```

**Returns:** All pending invitations for the current user

### 5. Accept Invitation
```http
PUT /users/me/organizations/invites/:inviteId/accept
Authorization: Bearer <token>
```

**Action:** Accept the invitation and become an active member

### 6. Decline Invitation
```http
PUT /users/me/organizations/invites/:inviteId/decline
Authorization: Bearer <token>
```

**Action:** Decline the invitation permanently

### 7. Update Member Role (Owner only)
```http
PUT /organizations/:organizationId/members/:userId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN" // or "MEMBER"
}
```

**Requirements:** Only organization owners can update roles

### 8. Remove Member (Owner/Admin only)
```http
DELETE /organizations/:organizationId/members/:userId
Authorization: Bearer <token>
```

**Requirements:** 
- Must be OWNER or ADMIN to remove members
- Cannot remove the organization owner

## Invitation Flow

### 1. Creating Organization
```http
POST /organizations
Authorization: Bearer <token>

{
  "name": "My Company",
  "description": "A great company",
  "organizationType": "Group"
}
```
**Result:** User becomes OWNER automatically

### 2. Inviting Members
```http
POST /organizations/{orgId}/members/invite
{
  "userId": "user-to-invite-id", 
  "role": "MEMBER"
}
```

### 3. User Checks Invitations
```http
GET /users/me/organizations/invites
```

### 4. User Accepts/Declines
```http
PUT /users/me/organizations/invites/{inviteId}/accept
```

## Invitation States
- **PENDING**: Invitation sent, waiting for response (expires in 7 days)
- **ACCEPTED**: User accepted and is now active member
- **DECLINED**: User declined the invitation
- **EXPIRED**: Invitation expired after 7 days

## Business Rules
1. **Auto-expiration**: Invitations expire after 7 days
2. **Single invitation**: One pending invitation per user per organization
3. **Owner protection**: Cannot remove or change role of organization owner
4. **Permission levels**: OWNER > ADMIN > MEMBER for management actions
5. **Self-invitation**: Users cannot invite themselves

## Example Response Formats

### Invitation Response
```json
{
  "id": "invite-id",
  "organizationId": "org-id",
  "userId": "user-id", 
  "role": "MEMBER",
  "status": "PENDING",
  "invitedBy": "inviter-user-id",
  "invitedAt": "2023-01-01T00:00:00Z",
  "expiresAt": "2023-01-08T00:00:00Z",
  "organization": {
    "id": "org-id",
    "name": "Company Name",
    "description": "Company description"
  }
}
```

### Member Response  
```json
{
  "id": "member-id",
  "organizationId": "org-id",
  "userId": "user-id",
  "role": "MEMBER", 
  "status": "ACCEPTED",
  "joinedAt": "2023-01-01T00:00:00Z",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Error Handling
- **404**: Organization/User/Invitation not found
- **409**: User already member or has pending invite
- **401**: Insufficient permissions 
- **400**: Invalid data or expired invitation
