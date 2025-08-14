# Sparqd Control Plane

This repository contains Sparqd Control Plane services:

| Service | Description | Stack |
| ------- | ----------- | ----- |
| [**control-plane**](./control-plane/) | Backend service which serve the API and Temporal workflow | [Express JS](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [Temporal](https://docs.temporal.io/) |
| [**control-plane-frontend**](./control-plane-frontend/) | SPARQD UI frontend | [Vite](https://vite.dev/) |

## Getting Started
TODO: running with complete docker-compose.yaml

## 1 Running Local Development Server

### 1.1 Running Supporting Services

The Control Plane requires several services to run before you can run or develop.

We've prepared a `docker-compose.dev.yaml` to help you prepare the required services required for development.

The `docker-compose.dev.yaml` contains of following services:
| # | Service | Description |
| - | ------- | ----------- |
| 1 | `keycloak` | Keycloak service |
| 2 | `keycloak-db` | Keycloak backend database on Postgres 16 |
| 3 | `postgres` | Control Plane backend database on Postgres 16 |
| 4 | `redis` | For caching -- not used yet |
| 5 | `temporal` | Temporal backend |
| 6 | `temporal-db` | Temporal backend database on Postgres 16 |
| 7 | `temporal-ui` | Temporal UI |

Environment variables for those services are controlled using `.env` file in the same level of `docker-compose.dev.yaml`. Example below:
```ini
REDIS_PORT=6379
POSTGRES_PORT=5432
KEYCLOAK_PORT=8080
```

```bash
sudo docker compose up -f docker-compose.dev.yaml -d
```

### 1.2 Running Control Plane API
Pre-requisites:
Install node js 
```bash
sudo apt install nodejs
```
Install PNPM:
```bash
wget -qO- https://get.pnpm.io/install.sh | sh -
```
Install nvm :
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
```
To install and use the latest Long-Term Support (LTS) version of Node.js using nvm,run the following commands:
```bash
nvm install --lts
nvm use --lts
```

Open a new terminal

```bash
cd control-plane
```
Installs all project dependencies defined in your `package.json` file using the `pnpm` package manager
```bash
pnpm install
```
Installs and runs Prisma Migrate in dev mode to apply changes to the database, create a migration file if needed, and generate the Prisma client.
```bash
npx prisma migrate dev
```
Generates the Prisma Client based on your schema.
```bash
npx prisma 
```
Runs the seed script to add initial data to the database, useful for local testing or resetting the DB
```bash
pnpm seed
```
To Populate the database with initial data for testing or development
```bash
pnpm dev
```

Control Plane backend service will be accessible on **http://localhost:3000.**

### 1.3 Running Control Plane Temporal Worker
Open a new terminal

```bash
cd control-plane
pnpm worker:clusterProvisioning # run clusterProvisioning Temporal Worker
```

Wait until this log appear:
```bash
[INFO] Worker state changed {
  sdkComponent: 'worker',
  taskQueue: 'clusterAutomation',
  state: 'RUNNING'
}
```

Keep it running on the terminal.

Temporal UI can be reached on **http://localhost:9080**

### 1.4 Running Control Plane UI

```bash
cd control-plane-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Development UI service will be available on **http://localhost:5173**
