CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    user_id bigint REFERENCES users(id),
    is_completed BOOLEAN
);

CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    order_id bigint REFERENCES orders(id),
    product_id bigint REFERENCES products(id),
    quantity INTEGER,
    UNIQUE (order_id, product_id)
);