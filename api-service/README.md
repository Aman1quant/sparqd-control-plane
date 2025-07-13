# Sparqd Control Plane API Service (TypeScript)

An implementation of control plane for Sparqd using [Express.js](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/). 

## 🚀 Features

* **TypeScript Support**: Leverages TypeScript for type safety and improved developer experience.
* **Express.js Framework**: Utilizes Express.js for handling HTTP requests and routing.
* **ESLint & Prettier**: Integrated for consistent code formatting and linting.
* **Modular Structure**: Organized project structure promoting scalability and maintainability.
* **Environment Configuration**: Manage environment variables seamlessly using `.env` files.
* **Package Management with pnpm**: Efficient and fast package management using [pnpm](https://pnpm.io/).

## 📁 Project Structure (TODO)

```bash
api-service/
├── src/
...
```

## 🛠️ Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v20 or later)
* [pnpm](https://pnpm.io/) (v6 or later)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sparqd/sparqd-control-plane.git
   cd sparqd-control-plane/api-service
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and define your environment variables as needed.

---

### Prisma: ORM & Database Migration
In this repository, we use Prisma as the ORM and migration tool.
#### Prisma CLI

* **Prisma commands:**

  ```bash
    Generate artifacts (e.g. Prisma Client)
    $ npx prisma generate

    Browse your data (http://localhost:5555 locally)
    $ npx prisma studio

    Create migrations from your Prisma schema, apply them to the database, generate artifacts (e.g. Prisma Client)
    $ npx prisma migrate dev

    Pull the schema from an existing database, updating the Prisma schema
    $ npx prisma db pull

    Push the Prisma schema state to the database
    $ npx prisma db push

    Validate your Prisma schema
    $ npx prisma validate

    Format your Prisma schema
    $ npx prisma format

    Display Prisma version info
    $ npx prisma version

    Display Prisma debug info
    $ npx prisma debug
  ```

#### Prisma Development Flow

##### 1. Make model changes (Local)
Modify your `schema.prisma`.

##### 2. Preview the migration (Local, no DB changes yet)
```bash
npx prisma migrate dev --name add_tables --create-only
```

##### 3. Review the generated SQL (Local, no DB changes yet)
Open `prisma/migrations/.../migration.sql` to inspect.

##### 4. Cancel or iterate (Local, no DB changes yet)
If it's not correct:
1. Fix the model
2. Delete the last created migration folder(s)
3. Repeat step 1–3

##### 5. Apply and test the migration (Local)
```bash
npx prisma migrate dev --name add_tables
```
That will:
- Applies migration to your local DB
- Updates _prisma_migrations
- Regenerates Prisma Client
- Runs prisma/seed.ts (if set up)

##### 6. Review changes in DB (Local)
Use `npx prisma studio`, raw SQL, or DB client to verify.
You can also use https://prismaliser.app/ to visualize.

##### 7. Revert the migration (Local)
If needed, reset the local DB (⚠️ deletes all data):
```bash
npx prisma migrate reset
```
You’ll be prompted to confirm.

##### 8 Deploy (Staging, Prod)
✅ Precondition
Your prisma/migrations/ folder is committed to Git.

###### Push migration files to Git
```bash
git add prisma/migrations/
git commit -m "Add role and permission tables"
```

As part of your CI/CD, you can run prisma migrate deploy as part of your pipeline to apply pending migrations to your production database.

Here is an example action that will run your migrations against your database:
```yaml
name: Deploy
on:
  push:
    paths:
      - prisma/migrations/**
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Apply all pending migrations to the database
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

### Running the Application

* **Create and migrate the local DB:**

  ```bash
  npx prisma migrate dev
  ```

* **Regenerate Prisma client DB:**

  ```bash
  npx prisma generate
  ```

* **Development Mode:**

  ```bash
  pnpm dev
  ```

* **Linting & Formatting:**

  ```bash
  pnpm lint
  ```

* **Test:**

  ```bash
  pnpm test
  ```

* **Production Build:**

  ```bash
  pnpm build
  pnpm start
  ```

## ✅ Scripts

* `pnpm dev`: Start the application in development mode with hot reloading.
* `pnpm build`: Compile TypeScript files to JavaScript.
* `pnpm start`: Run the compiled JavaScript in production mode.
* `pnpm lint`: Lint the codebase using ESLint.
* `pnpm format`: Format the codebase using Prettier.

---

## Naming Conventions

### Files & Folders

  ```
  // kebab-case for file and folder names to avoid case sensitivity 
  // Use descriptive names that reflect the file's purpose
  // Consider additional suffix to further describe file purpose

  // ✅ Good
  user.ts or user.service.ts
  auth.ts
  redis.client.ts
  helpers/
  user-profile/

  // ❌ Bad
  UserService.ts
  Redis Client.ts
  authController.ts
  Utils/
  UserProfile/
  ```

### Function, Variables & Constants

  ```
  // camelCase for variables and functions
  // Descriptive, meaningful names preferred

  // ✅ Good
  getUserProfile()
  isValidEmail
  userList

  // ❌ Bad
  GetUserProfile()
  email_Validator
  usrLst

  // UPPER_CASE with underscores for global constants

  // ✅ Good
  const MAX_RETRY_COUNT = 5;
  const API_BASE_URL = 'https://api.example.com';
  ```

### Classes, Interfaces, Types, Enums

  ```
  // PascalCase for classes, interfaces, custom types and enums

  // ✅ Good
  class UserController {}
  interface UserData {}

  type UserId = string;
  enum UserRole {
    Admin,
    Member,
    Guest
  }

  ```
