# Sparqd Control Plane
Sparqd Control Plane services

## 1 Running Local Development Server

The Control Plane requires several services to run before you can run or develop.

We've prepared a `docker-compose.yaml` to help you prepare the required services.

```bash
docker compose up -d
```

Environment variables are controlled using `.env` file in the same level of `docker-compose.local.yaml`. Example below:
```
REDIS_PORT=6379
POSTGRES_PORT=5432
KEYCLOAK_PORT=8080
```

## 2 Verify & Prepare Local Keycloak
The Docker Compose automatically import realm called `global-user` and set up email OTP based login.

After the Keycloak server ready, go to http://localhost:8080 and follow all below steps:

### 2.1 Login as kcadmin
- Login using username=`kcadmin` and password=`kcadmin`.

### 2.2 Change current realm into global-user
- On the left navigation bar, click on **Manage realms**
- On the table shown, click on **global-user** to activate the `global-user` realm.

### 2.3 Verify browser-otp-form
- On the left navigation bar, click on **Authentication**
- On the table shown, make sure **browser-otp-form** flow is available and Used by **Browser flow**.

### 2.4 Verify and update Github login
- On the left navigation bar, click on **Identity providers**
- On the table shown, make sure **github** identity provider is available
- Click on `github` record:
  - `Client ID` should be prepopulated. Fill if blank.
  - Update `Client Secret`.
  - Click on **Save**
