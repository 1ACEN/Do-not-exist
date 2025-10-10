# Healthcare Eclipse - Role-Based Dashboard System

## Overview

The Healthcare Eclipse application now includes completely separate, role-restricted dashboards for users and doctors. Access is strictly controlled through the login system, ensuring users can only access their appropriate dashboard based on their role.

## Role-Based Access Control

### 🔒 **Strict Role Enforcement**
- **Users (Clients)**: Can ONLY access `/dashboard/user`
- **Doctors**: Can ONLY access `/dashboard/doctor`
- **No Cross-Access**: Users cannot access doctor dashboard and vice versa
- **Login-Based**: Role is determined during registration/login process

### 🚫 **Access Denied Protection**
- If a user tries to access the wrong dashboard, they see an "Access Denied" screen
- Automatic redirects based on user role
- Loading states during authentication checks
- Fallback to login page for unauthorized access

## Dashboard Structure

### User Dashboard (`/dashboard/user`) - CLIENT ONLY
- **Access**: Only users with `role: "client"`
- **Purpose**: Personal health tracking and monitoring for patients/users
- **Features**:
  - Daily health logging (sleep, heart rate, blood pressure, steps, water intake, mood, stress)
  - Health goals tracking with progress indicators
  - AI-powered health insights and predictions
  - Interactive charts and visualizations (line charts, radar charts, bar charts, pie charts)
  - Health alerts and notifications
  - Streak tracking for consistent logging
  - Quick stats overview

### Doctor Dashboard (`/dashboard/doctor`) - DOCTOR ONLY
- **Access**: Only users with `role: "doctor"`
- **Purpose**: Patient management and monitoring for healthcare professionals
- **Features**:
  - Patient list with search and filtering
  - Risk level categorization (high, medium, low)
  - Patient vitals monitoring
  - Health trend analysis
  - Medical information management (conditions, medications)
  - Export functionality for reports
  - Alert system for critical patient conditions
  - Comprehensive patient profiles

### Main Dashboard (`/dashboard`) - ROLE ROUTER
- **Purpose**: Automatic role-based routing hub
- **Functionality**:
  - Automatically redirects users to appropriate dashboard based on their role
  - Shows loading state during authentication check
  - Strict enforcement - no manual selection
  - Redirects to login if no user or invalid role

## Navigation Updates

### 🔐 **Role-Based Site Navigation**
- **For Doctors**: Shows "Dashboard", "Analyst", "Analytics"
- **For Clients**: Shows "Dashboard", "Client", "Detective", "Surveys"
- **No Cross-Links**: Each role only sees their relevant navigation items

### 🚫 **Removed Public Access**
- Removed direct dashboard links from footer
- Removed dashboard selection from main page
- Access only through login → automatic redirect

## User Roles & Access

### Client Role (`role: "client"`)
- ✅ Access to `/dashboard/user`
- ❌ Blocked from `/dashboard/doctor`
- ✅ Personal health tracking features
- ✅ AI insights and recommendations

### Doctor Role (`role: "doctor"`)
- ✅ Access to `/dashboard/doctor`
- ❌ Blocked from `/dashboard/user`
- ✅ Patient management tools
- ✅ Medical monitoring and reporting capabilities

## Security Implementation

### Authentication Flow
1. User logs in through `/login`
2. System checks user role from JWT token
3. Automatic redirect to appropriate dashboard
4. Role validation on every dashboard access
5. Access denied screen for wrong role

### Access Control Features
- **JWT-based authentication** with role information
- **Client-side role checking** before rendering dashboard
- **Server-side role validation** in API endpoints
- **Automatic redirects** based on role
- **Loading states** during authentication
- **Error handling** for unauthorized access

## Technical Implementation

### Role Validation
```typescript
// Example role check in dashboard components
if (data.user.role !== "client") {
  setAccessDenied(true);
  return;
}
```

### Navigation Logic
```typescript
// Role-based navigation rendering
if (user.role === "doctor") {
  return <DoctorNavigation />;
}
return <ClientNavigation />;
```

### Automatic Routing
```typescript
// Main dashboard routing
if (data.user.role === "doctor") {
  router.push("/dashboard/doctor");
} else if (data.user.role === "client") {
  router.push("/dashboard/user");
}
```

## Getting Started

### For New Users
1. **Register** at `/register` and select your role (Client or Doctor)
2. **Login** at `/login` with your credentials
3. **Automatic Redirect** to your appropriate dashboard
4. **No Manual Selection** - system handles routing

### For Existing Users
1. **Login** at `/login`
2. **Automatic Redirect** based on your existing role
3. **Access Denied** if trying to access wrong dashboard

## Security Benefits

### ✅ **Complete Separation**
- No possibility of cross-access between roles
- Each dashboard is completely isolated
- Role-based navigation prevents confusion

### ✅ **Login-Enforced Access**
- Role determined at login time
- No manual dashboard selection
- Automatic routing based on authentication

### ✅ **Error Handling**
- Clear access denied messages
- Graceful fallbacks to login
- Loading states for better UX

## Future Enhancements

- **Multi-factor authentication** for enhanced security
- **Session management** with role-based timeouts
- **Audit logging** for access attempts
- **Role hierarchy** for different doctor levels
- **Patient-doctor relationship** management
- **Secure messaging** between roles
