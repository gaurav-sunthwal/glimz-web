# Glimz API Integration

This document describes the API integration implemented in the Glimz frontend application.

## API Endpoints Used

### Base URL
```
http://api.glimznow.com/api
```

### Authentication Endpoints

#### 1. Send OTP (`/user/login`)
- **Purpose**: Send OTP for user login/signup
- **Method**: POST
- **Headers**: Content-Type: application/json
- **Body**:
  ```json
  {
    "mobile_no": "8890668409",
    "isCreator": 0
  }
  ```
- **Response**:
  ```json
  {
    "status": true,
    "code": 200,
    "message": "User updated, OTP has been sent successfully!",
    "otp": "4927"
  }
  ```

#### 2. Verify OTP (`/user/otp-verified`)
- **Purpose**: Verify OTP and get authentication token
- **Method**: POST
- **Headers**: Content-Type: application/json
- **Body**:
  ```json
  {
    "mobile_no": "8890668409",
    "otp": "9955"
  }
  ```
- **Response**:
  ```json
  {
    "status": true,
    "code": 200,
    "message": "OTP verified successfully!",
    "auth_token": "eyJhbGciOiJIUzI1NilsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 3. Resend OTP (`/user/resend-otp`)
- **Purpose**: Resend OTP if expired
- **Method**: POST
- **Headers**: Content-Type: application/json
- **Body**:
  ```json
  {
    "mobile_no": "8890668409"
  }
  ```
- **Response**:
  ```json
  {
    "status": true,
    "code": 200,
    "message": "OTP has been sent successfully!",
    "otp": "6024"
  }
  ```

### User Management Endpoints

#### 4. Create Viewer (`/viewer/create`)
- **Purpose**: Create viewer/user account
- **Method**: POST
- **Headers**: 
  - Content-Type: application/json
  - auth_token: [JWT token]
  - uuid: [user UUID]
- **Body**:
  ```json
  {
    "first_name": "Shlok",
    "last_name": "Sarda",
    "email": "sardashlok2004@gmail.com",
    "username": "shlok1504"
  }
  ```
- **Response**:
  ```json
  {
    "status": false,
    "code": 409,
    "message": "User already registered!!"
  }
  ```

#### 5. Get Viewer Details (`/viewer/getDetail`)
- **Purpose**: Fetch user account details
- **Method**: POST
- **Headers**: Content-Type: application/json
- **Body**:
  ```json
  {
    "uuid": "5977e59a-1296-4927-afd0-376b110f5ec2"
  }
  ```
- **Response**:
  ```json
  {
    "status": true,
    "code": 200,
    "message": "Viewer is Registered",
    "ViewerDetail": {
      "viewer_id": 8,
      "user_id": 9,
      "uuid": "5977e59a..."
    }
  }
  ```

## Implementation Details

### Files Created/Modified

1. **`app/lib/api.js`** - Main API service with all endpoint functions
2. **`app/lib/jwtUtils.js`** - JWT token handling utilities
3. **`app/signup/mobile/[userType]/page.jsx`** - Mobile number entry with OTP sending
4. **`app/signup/otp/page.jsx`** - OTP verification with resend functionality
5. **`app/signup/user/page.jsx`** - User signup form with API integration
6. **`app/signup/creator/page.jsx`** - Creator signup form with API integration
7. **`app/login/page.jsx`** - Login page for existing users
8. **`app/components/ProtectedRoute.jsx`** - Route protection component
9. **`app/components/UserProfile.jsx`** - User profile display component

### Authentication Flow

1. **Signup Flow**:
   - User enters mobile number → API sends OTP
   - User enters OTP → API verifies and returns auth token
   - User fills profile form → API creates account
   - User redirected to home page

2. **Login Flow**:
   - User enters mobile number → API sends OTP
   - User enters OTP → API verifies and returns auth token
   - User redirected to home page

3. **Token Management**:
   - JWT tokens stored in localStorage
   - UUID extracted from token or generated
   - Automatic token expiration checking
   - Logout clears all stored data

### Usage Examples

#### Sending OTP
```javascript
import { apiService } from '../lib/api';

const response = await apiService.sendOTP('8890668409', 0); // 0 for user, 1 for creator
```

#### Verifying OTP
```javascript
const response = await apiService.verifyOTP('8890668409', '123456');
if (response.status) {
  // OTP verified, user is authenticated
}
```

#### Creating User Account
```javascript
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  username: 'johndoe'
};

const response = await apiService.createViewer(userData);
```

#### Checking Authentication
```javascript
if (apiService.isAuthenticated()) {
  // User is logged in
  const user = apiService.getCurrentUser();
}
```

#### Logout
```javascript
apiService.logout();
```

### Error Handling

The API service includes comprehensive error handling:
- Network errors are caught and displayed to users
- API error responses are shown with appropriate messages
- Loading states are managed for better UX
- Form validation and error display

### Security Features

- JWT token validation and expiration checking
- Secure token storage in localStorage
- Automatic token refresh handling
- Protected routes for authenticated users
- Secure logout functionality

## Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to `/signup` to test the signup flow
3. Navigate to `/login` to test the login flow
4. Use the mobile number and OTP from the API documentation for testing

## Notes

- The API currently uses hardcoded test data for demonstration
- In production, ensure proper HTTPS and secure token handling
- Consider implementing refresh token functionality for better security
- Add rate limiting for OTP requests in production
- Implement proper error logging and monitoring
