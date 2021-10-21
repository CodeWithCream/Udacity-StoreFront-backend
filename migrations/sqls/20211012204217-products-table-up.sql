CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE,
    price NUMERIC,
    category VARCHAR(50)
);