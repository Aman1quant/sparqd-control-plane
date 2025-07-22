# Sparqd Control Plane
Sparqd Control Plane services

## 1 Running Local Development Server

### 1.1 Running Supporting Services

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

### 1.2 Running Control Plane API

```bash
cd api-service
pnpm install
npx prisma migrate dev
npx prisma generate
pnpm seed
pnpm dev
```


## 2 Verify & Prepare Local Keycloak
The Docker Compose automatically import realm called `global-users` and set up email OTP based login.

After the Keycloak server ready, go to http://localhost:8080 and follow all below steps:

### 2.1 Login as kcadmin
- Login using username=`kcadmin` and password=`kcadmin`.

### 2.2 Change current realm into global-users
- On the left navigation bar, click on **Manage realms**
- On the table shown, click on **global-users** to activate the `global-users` realm.

### 2.3 Verify global-users Realm Settings
- On the left navigation bar, click on **Realm settings**

#### 2.3.1 Verify Realm Login
- On the content, click on **Login** tab:
  - on **Login screen customization**, make sure:
    - User registration: __On__
    - Forgot password: __On__
    - Remember me: __Off__
  - on **Email settings**, make sure:
    - Email as username: __On__
    - Login with email: __On__
    - Duplicate emails: __Off__
    - Verify email: __Off__

#### 2.3.2 Verify Realm Email
- On the content, click on **Email** tab:
  - on **Template**, make sure:
    - From: for example `noreply@<domain.com>
    - From display name: for example No Reply

  - on **Connection & Authentication**, make sure:
    - Host: _SMTP host_
    - Port: _SMTP port_
    - Encryption: _as required_
    - Authentication: **Enabled**
    - Username: _SMTP EMAIL_
    - Authentication type: _as required_
    - Password: _update  --- The value from imported data is only `***********`_


  - on **Template**, make sure:
    - From: for example `noreply@<domain.com>

### 2.4 Verify Authentication
- On the left navigation bar, click on **Authentication**

#### 2.4.1 Verify browser-otp-form
- On the table shown, make sure **browser-otp-form** flow is available and Used by **Browser flow**.
  - Check detail and make sure the flow as below:
      * `flow` **browser email otp forms**: _Alternative_

          * `step` **Username Form**: _Required_

              * `flow` **browser email password/otp auth**: _Required_

                  * `step` **Password Form**: _Alternative_

                  * `step` **Email TOTP Authentication**: _Alternative_

              * `flow` **browser otp forms Browser - Conditional OTP**: _Conditional_

                  * `condition` **Condition - user configured**: _Required_

                  * `step` **OTP Form**: _Required_

#### 2.4.1 Verify registration email otp
- On the table shown, make sure **registration email otp** flow is available and Used by **Registration flow**.
  - Check detail and make sure the flow as below:
      * `flow` **registration email otp registration forms**: _Required_

          * `step` **Registration User Profile Creation**: _Required_

          * `step` **Password Validation**: _Disabled_

          * `step` **reCAPTCHA**: _Disabled_

          * `step` **Terms and conditions**: _Disabled_

          _Add new *Email TOTP Authentication* step:_
          * `execution` **Email TOTP Authentication**: _Required_
              * Click on gear button right of **Email TOTP Authentication** and make sure **Alias** = `registration email otp config`.

### 2.5 Verify and update Github login
- On the left navigation bar, click on **Identity providers**
- On the table shown, make sure **github** identity provider is available
- Click on `github` record:
  - `Client ID` should be prepopulated. Fill if blank.
  - Update `Client Secret` --- The value from imported data is only `***********`
  - Click on **Save**
