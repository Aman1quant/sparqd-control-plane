# Forgot Password Flow

## Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant UI as Frontend
    participant BE as Control Plane Backend
    participant DB as PostgreSQL
    participant KC as Keycloak

    U->>UI: Enters email address
    UI->>BE: POST /auth/forgot-password {email}

    BE->>DB: Check if user exists with email
    alt user not exists
        DB-->>BE: User not found
        BE-->>UI: 404 Not Found - User not found
        UI-->>U: Email not found in system
    else user exists
        DB-->>BE: Return user with account info (including realm)

        BE->>KC: Call forgot password API in user's realm
        Note over BE,KC: Keycloak handles password reset token generation<br/>and sends email directly to user

        KC-->>BE: Password reset initiated
        BE-->>UI: 200 OK - Reset email sent
        UI-->>U: Check your email for reset instructions

        Note over U,KC: User receives email directly from Keycloak<br/>and clicks reset link

        U->>KC: Clicks reset link from email
        KC->>U: Show Keycloak password reset form
        U->>KC: Enters new password
        KC->>KC: Validate and update password
        KC->>U: Password reset successful, redirect to login
    end
```

## Implementation

| File Path                                                 | Description                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `api-service/src/routes/v1/auth.route.ts`                 | Defines HTTP routes for forgot password (e.g. `/v1/auth/forgot-password`) |
| `api-service/src/services/auth.service.ts`                | Contains core business logic for triggering Keycloak password reset       |
| `api-service/src/controllers/auth.controller.ts`          | Handles HTTP request/response for forgot password endpoints               |
| `api-service/src/config/clients/keycloak-admin.client.ts` | Manages Keycloak Admin client for triggering password reset               |
| `api-service/prisma/schema.prisma`                        | Database schema for user and account info (no token storage needed)       |

