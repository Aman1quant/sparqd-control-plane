# Forgot Password Flow

## Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant UI as Frontend
    participant BE as Control Plane API
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
| `control-plane/src/routes/v1/auth.route.ts`                 | Defines HTTP routes for forgot password (e.g. `/v1/auth/forgot-password`) |
| `control-plane/src/services/auth.service.ts`                | Contains core business logic for triggering Keycloak password reset       |
| `control-plane/src/controllers/auth.controller.ts`          | Handles HTTP request/response for forgot password endpoints               |
| `control-plane/src/config/clients/keycloak-admin.client.ts` | Manages Keycloak Admin client for triggering password reset               |
| `control-plane/prisma/schema.prisma`                        | Database schema for user and account info (no token storage needed)       |

## Effect on Resources

Following are the list of resources affected after successful operation.

| Resource                         | Resource Type    | Effect                                                              | Status      |
| -------------------------------- | ---------------- | ------------------------------------------------------------------- | ----------- |
| `public.users`                   | Database table   | **User** record queried with email and account relationships        | Implemented |
| `public.accounts`                | Database table   | **Account** info retrieved via user.accounts relationship           | Implemented |
| `public.account_members`         | Database table   | **AccountMember** relationship queried to get realm info            | Implemented |
| `Keycloak Admin Client`          | Keycloak Service | **Admin client** initialized to access realm-specific operations    | Implemented |
| `Keycloak User Query`            | Keycloak API     | **User lookup** performed in each account's realm by email          | Implemented |
| `Keycloak Execute Actions Email` | Keycloak API     | **UPDATE_PASSWORD** action email sent with 5-minute lifespan        | Implemented |
| `Keycloak SMTP Service`          | Keycloak Email   | **Password reset email** sent directly by Keycloak to user          | Implemented |
| `public.audit_logs`              | Database table   | **AuditLog** records for password reset requests should be recorded | **TODO**    |

