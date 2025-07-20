# Signup/Registration Using Email TOTP

## Configuration

The `docker-compose.yaml` already include the [keycloak-email-otp](https://github.com/5-stones/keycloak-email-otp) SPI JAR provider file.

### 1. Duplicate the Default "registration" flow
Go to the **Authentication** section for your **realm** and make a copy of the default/built-in **registration** flow. Name it something like **registration email otp**.

### 2. Replace The Username Password Form
Edit the new flow and delete following. So it will become like this:

* `flow` **registration email otp registratio forms**: _Required_

    * `step` **Registration User Profile Creation**: _Required_

    * `step` **Password Validation**: _Disabled_

    * `step` **reCAPTCHA**: _Disabled_

    * `step` **Terms and conditions**: _Disabled_

    _Add new *Email TOTP Authentication* step:_
    * `execution` **Email TOTP Authentication**: _Required_
        * Click on gear button right of **Email TOTP Authentication** and make sure **Alias** = `registration email otp config`.


### 3. Finishing Up
Finally you need to bind your newly created Authentication flow to the **registration Flow**.
- Click on the _three dots button_ of **registration email otp** --> Choose **Bind flow** --> Choose **Registration Flow**.
