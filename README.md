# Udacity-Storefront-backend
This project is created for the Udacity Full Stack Javascript Developer Nanodegree Program. 

## Description
The project consists of the Node.js project serving the API to handle shopping app. 

## Requirements

### Database
To use the API, first create Postgres database.

Database can be created with following statements:
```
CREATE USER <DATABASE_USER> WITH PASSWORD <DATABASE_PASSWORD>;
CREATE DATABASE <DATABASE_NAME>;
\c <DATABASE_NAME>
GRANT ALL PRIVILEGES ON DATABASE <DATABASE_NAME> TO <DATABASE_USER>;
```

Migrate database to newest version
```
db-migrate up
```

### ENV variables
For the backend app to work, following ENV variables have to be filled. 
```
ENV=dev
DATABASE_HOST
DATABASE_NAME
DATABASE_USER
DATABASE_PASSWORD
SALT_ROUNDS
PEPPER
TOKEN_SECRET
```

## Usage
To use an API, frist you have to build and start the aplication:

```
npm run build
```
```
npm run start:dev //if you want to test typescript code
```
or 
```
npm run start:prod //if you want to test built code
```


If you want to make your life easier you can use:
```
npm run build-and-run-dev
```
or 
```
npm run build-and-run-prod
```

To use an API just enter the URL in the browser or create request in the Postman.
```
http://localhost:3001/products/
http://localhost:3001/users/
http://localhost:3001/orders/
```
etc.

## Testing
To run tests, first create test database and fill ENV variables.
```
TEST_DATABASE_HOST
TEST_DATABASE_NAME
TEST_DATABASE_USER
TEST_DATABASE_PASSWORD
```

Migrate database to newest version
```
db-migrate up
```

To run all tests, execute existing script
```
npm run build-and-test
```