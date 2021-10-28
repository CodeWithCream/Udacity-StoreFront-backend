# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints
#### Products
- Index 
    - route: '/products' [GET]
- Show
    - route: '/products/:id' [GET]
- Create [token required]
    - route: '/products' [POST]
- [OPTIONAL] Top 5 most popular products 
    - route: '/popular-products?count=5' [GET]
- [OPTIONAL] Products by category (args: product category)
    - route: '/products?category=food' [GET]

#### Users
- Index [token required]
    - route: '/users' [GET]
- Show [token required]
    - route: '/users/:id' [GET]
- Create N[~~token required~~]
    - route: '/users' [POST]

#### Orders
- Current Order by user (args: user id)[token required]
    - route: '/users/:id/currentOrder' [GET]
- [OPTIONAL] Completed Orders by user (args: user id)[token required]
    - route: '/users/:id/orders?completed=true' [GET]

## Data Shapes
#### Product
- id
- name
- price
- [OPTIONAL] category

#### User
- id
- firstName
- lastName
- username
- password

#### Orders
- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (active or complete)

#### Order Products
- productId
- product details filled when selected from database, null when inserting to database (then productId is used)
- quanity

## Database tables
- products (id: SERIAL PRIMARY KEY, name: VARCHAR, price: NUMERIC, category: VARCHAR(50))
- users(id: SERIAL PRIMARY KEY, first_name: VARCHAR(100), last_name: VARCHAR(100), password_digest VARCHAR)
- orders(id: SERIAL PRIMARY KEY, user_id: bigint REFERENCES users(id), is_complete: BOOLEAN)
- order_products (order_id: bigint REFERENCES orders(id), product_id: bigint REFERENCES products(id), quantity: INTEGER)