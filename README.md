# Sparqd Control Plane
Sparqd Control Plane services

## Running Local Development Server

The Control Plane requires several services to run before you can run or develop.

We've prepared a `docker-compose.local.yaml` to help you prepare the required services.

```bash
docker compose -f docker-compose.local.yaml up -d
```

Environment variables are controlled using `.env` file in the same level of `docker-compose.local.yaml`. Example below:
```
REDIS_PORT=6379
KEYCLOAK_PORT=8080
```
