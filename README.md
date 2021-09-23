## Node-Engineering-Test
## Aim

This test aims at checking the following in your implementation:

- Integrating third-party APIs
- MySQL efficiency, migrations etc
- Documenting with postman
- Writing Restful API knowledge
- JS Knowledge
- API responses
- Database Transaction.
- Schema Structure.
- Adonis Knowledge

## Instructions and Integrations

You will be building a basic fin tech  API with the following User stories.

- User can create an account(Basic Information- email, name, password)
- User can fund their Account with Card or Bank Transfer.
- User can send money to another User using their email.
- User can add beneficiaries (bank to withdraw to).
- User can only withdraw money to their Beneficiaries.
- Use webhook only to confirm if transfer or funding is successful (checkout Ngrok to help out).

## Challenges

- I faced some issues working with paystack transfer endpoins, from my findings online, i need to have a registered bussiness to use this endpoint and i am getting a status code 400, hence i was able to `create transfer recipient` endpoint
- I wasn't able to expose my endpoints on heroku, i need to add a credit card to use an instance of `ClearDBMySQL` as add-ons, and heroku is some how having issues validating my credit cards



## Getting Started
### Prerequisites
The tools listed below are needed to run this application:
* Node v14 or above
* Npm v6.0.0 or above

You can check the Node.js and npm versions by running the following commands.

### check node.js version
`node -v`

### check npm version
`node -v`

## Installation

* Install project dependencies by running `npm install`.

* Run the migrations to create database tables by running `node ace migration:run`

* Access endpoints on `localhost:3333`



## docker-compose for local development

`docker-compose up --build -d`

`docker-compose exec docker-adonis-api sh`

`node ace migration:run`

## Endpoints

| Method      | Description    | Endpoints    | Role   | 
| :------------- | :----------: | -----------: | -----------: |
|  POST | Create user   | /api/v1/auth/signup    | *   |
| POST   | signin user | /api/v1/auth/signin | * |
|  POST | credit   | /api/v1/credit    | client   |
|  POST | submit PIN   | /api/v1/submit_pin    | client   |
|  POST | submit OTP   | /api/v1/submit_otp    | client   |
|  POST | submit PHONE   | /api/v1/submit_phone   | client   |
|  POST | transfer   | /api/v1/debit   | client   |
|  POST | add beneficiary  | /api/v1/beneficiary    | client   |
|  POST | create transfer recipient  | /api/v1/transfer    | client   |

## Postman documentation

https://documenter.getpostman.com/view/11998048/UUxwBUSq

## Paystack test cards

https://docs-v1.paystack.com/docs/test-cards

#### Please check paystack documentation on webhook endpoint setup and ngrok for local testing

https://paystack.com/docs/payments/webhooks/
