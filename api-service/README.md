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

### Running the Application

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


## Naming Convention

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
