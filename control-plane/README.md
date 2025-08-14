# SPARQD Control Plane API Service (TypeScript)

An implementation of control plane for SPARQD using [Express.js](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/).
Included also workflow management using [Temporal](https://temporal.io).

## Quickstart

```bash
# Install dependencies
pnpm install
# Installs and runs Prisma Migrate in dev mode to apply changes to the database, create a migration file if needed, and generate the Prisma client.
npx prisma migrate dev
# Generates the Prisma Client based on your schema.
npx prisma generate
# Runs the seed script to add initial data to the database, useful for local testing or resetting the DB
pnpm seed
# Run development server
pnpm dev
```

## 🚀 Features

* **TypeScript Support**: Leverages TypeScript for type safety and improved developer experience.
* **Express.js Framework**: Utilizes Express.js for handling HTTP requests and routing.
* **ESLint & Prettier**: Integrated for consistent code formatting and linting.
* **Modular Structure**: Organized project structure promoting scalability and maintainability.
* **Environment Configuration**: Manage environment variables seamlessly using `.env` files.
* **Package Management with pnpm**: Efficient and fast package management using [pnpm](https://pnpm.io/).

## 📁 Project Structure (TODO)

```bash
control-plane/
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
   cd sparqd-control-plane/control-plane
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

* **Prisma commands cheatsheets**

| Description | Command | Notes |
| --- | --- | --- |
| Generate artifacts (e.g. Prisma Client) | `$ npx prisma generate` | Run after updating `schema.prisma` to regenerate the client code. |
| Browse your data ([http://localhost:5555](http://localhost:5555) locally) | `$ npx prisma studio` | Opens a web UI to view and edit data directly in your database. |
| Create migrations from your Prisma schema, apply them to the DB, generate artifacts (e.g. Prisma Client) | `$ npx prisma migrate dev` | Best used in development; creates and applies migrations automatically. |
| Pull the schema from an existing database, updating the Prisma schema | `$ npx prisma db pull` | Good for reverse-engineering an existing database into Prisma format. |
| Push the Prisma schema state to the database | `$ npx prisma db push` | Directly updates the database to match schema (no migration history, caution in prod). |
| Validate your Prisma schema | `$ npx prisma validate` | Checks if your schema file is valid. |
| Format your Prisma schema | `$ npx prisma format` | Auto-formats the `schema.prisma` file for consistency. |
| Display Prisma version info | `$ npx prisma version` | Shows CLI and client versions. |
| Display Prisma debug info | `$ npx prisma debug` | Useful for diagnosing issues; shows environment info. |
| If needed, reset the local DB (⚠️ deletes all data) | `$ npx prisma migrate reset` | Drops all data and reapplies migrations — great for starting fresh in development. |


#### Prisma Development Flow

##### 1. Make model changes (Local)
Modify your `schema.prisma`.

##### 2. Preview the migration (Local, no DB changes yet)
```bash
npx prisma migrate dev --name add_initial_tables --create-only
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
npx prisma migrate dev --name add_initial_tables
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

### Running the Application

| Description                        | Command                     |
|------------------------------------|-----------------------------|
| Create and migrate the local DB    | `$ npx prisma migrate dev`  |
| Regenerate Prisma client DB        | `$ npx prisma generate`     |
| Seed DB                            | `$ pnpm seed`               |
| Development mode                   | `$ pnpm dev`                |
| Linting & Formatting               | `$ pnpm lint`               |
| Test                               | `$ pnpm test`               |
| Generate production build          | `$ pnpm build`              |


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
