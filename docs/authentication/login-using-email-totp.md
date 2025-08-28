# Login Using Email TOTP

## Configuration

The `docker-compose.yaml` already include the [keycloak-email-otp](https://github.com/5-stones/keycloak-email-otp) SPI JAR provider file.

### 1. Duplicate the Default "browser" flow
Go to the **Authentication** section for your **realm** and make a copy of the default/built-in **browser** flow. Name it something like **browser email otp**.

### 2. Replace The Username Password Form
Edit the new flow and delete the **Username Password Form** in the **browser otp forms** sub-flow.

So it will become like this:

* `flow` **browser email otp forms**: _Alternative_

    * `step` **Username Form**: _Required_

        * `flow` **browser email password/otp auth**: _Required_

            * `step` **Password Form**: _Alternative_

            * `step` **Email TOTP Authentication**: _Alternative_

        * `flow` **browser otp forms Browser - Conditional OTP**: _Conditional_

            * `condition` **Condition - user configured**: _Required_

            * `step` **OTP Form**: _Required_

### 3. Finishing Up
Finally you need to bind your newly created Authentication flow to the **Browser Flow**.
- Click on the _three dots button_ of **browser email otp** --> Choose **Bind flow** --> Choose **Browser Flow**.