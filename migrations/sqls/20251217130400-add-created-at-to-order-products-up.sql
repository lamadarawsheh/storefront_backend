/* Replace with your SQL commands */
ALTER TABLE order_products
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
