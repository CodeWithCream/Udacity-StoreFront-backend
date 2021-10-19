CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(30),
    password_digest VARCHAR
);