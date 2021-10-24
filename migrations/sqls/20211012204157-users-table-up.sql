CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    password_digest VARCHAR
);