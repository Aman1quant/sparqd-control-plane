# Signup Flow

## Flow Diagram
```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant UI as Frontend
    participant BE as Control Plane Backend
    participant DB as PostgreSQL
    participant KC as Keycloak

    U->>UI: Enters name, email, password
    UI->>BE: POST /auth/signup {accountName, email, password, fullName}

    BE->>DB: Check if email already exists
    DB-->>BE: Not found

    BE->>DB: Create Account (Account table)
    DB-->>BE: Return account with UID

    BE->>KC: Create Realm (account.uid)
    KC-->>BE: Created

    BE->>KC: Create Client (clientId=control-plane)
    KC-->>BE: Created

    BE->>KC: Create User in realm (email + password)
    KC-->>BE: Created

    BE->>KC: Find created user by email
    KC-->>BE: Return Keycloak user ID (kcSub)

    BE->>DB: Get Role: AccountAdmin
    DB-->>BE: Return Role

    BE->>DB: Create User + AccountMember
    DB-->>BE: Return User with account/role

    BE-->>UI: 201 Created {user, account}
```

## Implementation

| File Path                                                 | Description                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| `api-service/src/routes/v1/auth.route.ts`                 | Defines HTTP routes for authentication (e.g. `/v1/auth/signup`)     |
| `api-service/src/services/auth.service.ts`                | Contains core business logic for signup, login, user creation, etc. |
| `api-service/src/controllers/auth.controller.ts`          | Handles HTTP request/response, calls service methods                |
| `api-service/src/config/clients/keycloak-admin.client.ts` | Initializes and manages the Keycloak Admin client                   |
| `api-service/prisma/schema.prisma`                        | Defines the database schema (User, Account, Role, etc.) for Prisma  |
| `api-service/prisma/seed.ts`                              | Seeds initial roles like `Admin`, `AccountAdmin` into the database  |
