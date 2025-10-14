# DummyJSON Authentication Integration

## Overview

This project uses [DummyJSON](https://dummyjson.com/) as the authentication backend, providing a realistic API integration for demonstration purposes. DummyJSON is a free fake REST API that provides ready-to-use test data and authentication endpoints.

## Authentication Flow

### Login
The authentication system uses DummyJSON's `/auth/login` endpoint with JWT token-based authentication:

1. User provides username and password
2. App sends POST request to `https://dummyjson.com/auth/login`
3. API returns user data along with `accessToken` and `refreshToken`
4. Tokens are stored securely using AsyncStorage via Zustand persistence

### Token Refresh
When tokens expire, the app automatically refreshes them using the `/auth/refresh` endpoint:

1. App sends POST request with `refreshToken`
2. API returns new `accessToken` and `refreshToken`
3. Tokens are updated in the app state

### User Profile
The app can fetch current user data using the `/auth/me` endpoint with the access token.

## Available Test Accounts

DummyJSON provides multiple test accounts. Here are some you can use:

| Username | Password | User Info |
|----------|----------|-----------|
| `emilys` | `emilyspass` | Emily Johnson (Admin) |
| `michaelw` | `michaelwpass` | Michael Williams (Admin) |
| `sophiab` | `sophiabpass` | Sophia Brown (Admin) |
| `jamesd` | `jamesdpass` | James Davis (Admin) |
| `emmaj` | `emmajpass` | Emma Miller (Admin) |
| `oliviaw` | `oliviawpass` | Olivia Wilson (Moderator) |
| `alexanderj` | `alexanderjpass` | Alexander Jones (Moderator) |
| `avat` | `avatpass` | Ava Taylor (User) |

See all available users at: https://dummyjson.com/users

## API Endpoints Used

### POST /auth/login
Authenticates a user and returns tokens.

**Request:**
```json
{
  "username": "emilys",
  "password": "emilyspass",
  "expiresInMins": 60
}
```

**Response:**
```json
{
  "id": 1,
  "username": "emilys",
  "email": "emily.johnson@x.dummyjson.com",
  "firstName": "Emily",
  "lastName": "Johnson",
  "gender": "female",
  "image": "https://dummyjson.com/icon/emilys/128",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/refresh
Refreshes the authentication tokens.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresInMins": 60
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/me
Returns current authenticated user's profile.

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "id": 1,
  "username": "emilys",
  "email": "emily.johnson@x.dummyjson.com",
  "firstName": "Emily",
  "lastName": "Johnson",
  ...
}
```

## Implementation Details

### File Structure

- **`src/utils/authApi.ts`**: Contains all API integration logic with DummyJSON
- **`src/store/authStore.ts`**: Zustand store for authentication state management
- **`src/types/auth.ts`**: TypeScript interfaces for auth-related types
- **`src/hooks/useAuth.ts`**: Custom hook for auth operations

### Key Features

1. **Real API Integration**: Actual HTTP requests to DummyJSON endpoints
2. **JWT Tokens**: Proper token-based authentication with access and refresh tokens
3. **Token Persistence**: Tokens stored in AsyncStorage for session persistence
4. **Automatic Refresh**: Token refresh on expiration
5. **Type Safety**: Full TypeScript support with proper types

### Limitations

Since DummyJSON is a demo API, certain features are not available:

- **No User Registration**: You cannot create new accounts; only pre-existing test accounts work
- **No Password Reset**: Password reset functionality is not supported
- **No Email Verification**: All users are considered verified
- **No Profile Updates**: User profiles cannot be modified
- **Stateless Tokens**: Tokens don't actually expire server-side (handled client-side for demo)

## Usage in the App

### Login Screen
Navigate to the Login screen and use any of the test accounts listed above. The UI provides a hint showing available usernames.

### Biometric Authentication
When biometric authentication is enabled, it uses the `emilys` account credentials as a demo after successful biometric verification.

### Sign Up Screen
The Sign Up screen displays a message explaining that registration is not available and directs users to use test accounts.

## For Production Use

To adapt this code for a real production environment:

1. Replace `DUMMYJSON_API_BASE` with your actual API URL
2. Update API request/response formats to match your backend
3. Implement actual user registration endpoints
4. Add proper error handling and retry logic
5. Implement secure token storage (consider using Keychain/Keystore)
6. Add proper token expiration validation
7. Implement logout endpoint if needed
8. Add comprehensive security measures (SSL pinning, etc.)

## Resources

- **DummyJSON Documentation**: https://dummyjson.com/docs/auth
- **Available Users**: https://dummyjson.com/users
- **API Playground**: https://dummyjson.com/

## Testing

To test the authentication flow:

1. Run the app: `npm run ios` or `npm run android`
2. Navigate to the Login screen
3. Enter test credentials (e.g., `emilys` / `emilyspass`)
4. Verify successful login and navigation to home screen
5. Test token refresh by waiting (tokens expire after 60 minutes)
6. Test logout functionality

## Security Considerations

While DummyJSON is excellent for demos, remember:

- Never use it in production
- All data is public and shared among users
- Tokens are not truly secure as the API is open
- This is for demonstration and learning purposes only

For production apps, always:
- Use HTTPS for all API calls
- Implement proper authentication backend
- Store tokens securely (Keychain/Keystore)
- Implement certificate pinning
- Add proper rate limiting and security measures
