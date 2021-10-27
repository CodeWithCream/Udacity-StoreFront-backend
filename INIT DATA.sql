--
-- TOC entry 3005 (class 0 OID 53524)
-- Dependencies: 204
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: udacity
--

INSERT INTO public.users (id, first_name, last_name, username, password_digest) VALUES (1, 'User1', 'User1', 'user1', '$2b$10$cofaOTnAiixBDz59m6SmQeftzMK78VZ/9nIZwMj5N/2cDhD6vUOIm');
INSERT INTO public.users (id, first_name, last_name, username, password_digest) VALUES (2, 'User2', 'User2', 'user2', '$2b$10$5DqWrKoHPqJgCyPPR1.QW.YKg9k41z0WRtfoADqd5iVBXymTzVXd6');


--
-- TOC entry 3009 (class 0 OID 53550)
-- Dependencies: 208
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: udacity
--

INSERT INTO public.orders (id, user_id, is_completed) VALUES (1, 1, true);
INSERT INTO public.orders (id, user_id, is_completed) VALUES (2, 1, true);
INSERT INTO public.orders (id, user_id, is_completed) VALUES (3, 2, true);
INSERT INTO public.orders (id, user_id, is_completed) VALUES (4, 2, true);
INSERT INTO public.orders (id, user_id, is_completed) VALUES (5, 2, true);
INSERT INTO public.orders (id, user_id, is_completed) VALUES (6, 1, true);
INSERT INTO public.orders (id, user_id, is_completed) VALUES (7, 1, false);
INSERT INTO public.orders (id, user_id, is_completed) VALUES (8, 2, false);


--
-- TOC entry 3007 (class 0 OID 53537)
-- Dependencies: 206
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: udacity
--

INSERT INTO public.products (id, name, price, category) VALUES (1, 'Bread', 2, 'food');
INSERT INTO public.products (id, name, price, category) VALUES (2, 'Milk', 1, 'food');
INSERT INTO public.products (id, name, price, category) VALUES (3, 'Chocolate', 3, 'food');
INSERT INTO public.products (id, name, price, category) VALUES (4, 'The Mindset', 20, 'books');
INSERT INTO public.products (id, name, price, category) VALUES (5, 'Lenovo T40', 2000, 'electronics');
INSERT INTO public.products (id, name, price, category) VALUES (6, 'Samsung Galaxy S20', 1500, 'electronics');
INSERT INTO public.products (id, name, price, category) VALUES (7, 'Pen', 1.2, 'Other');
INSERT INTO public.products (id, name, price, category) VALUES (8, 'Glue', 1.5, 'Other');


--
-- TOC entry 3011 (class 0 OID 53563)
-- Dependencies: 210
-- Data for Name: order_products; Type: TABLE DATA; Schema: public; Owner: udacity
--

INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (2, 1, 1, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (3, 1, 2, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (4, 1, 3, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (5, 2, 1, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (6, 2, 3, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (7, 2, 4, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (8, 3, 1, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (9, 3, 2, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (10, 3, 3, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (11, 3, 5, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (12, 3, 6, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (13, 4, 2, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (14, 4, 3, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (15, 4, 4, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (16, 4, 5, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (17, 4, 7, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (18, 5, 2, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (19, 5, 3, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (20, 6, 2, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (21, 6, 3, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (22, 6, 8, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (23, 7, 5, 1);
INSERT INTO public.order_products (id, order_id, product_id, quantity) VALUES (24, 8, 5, 1);
