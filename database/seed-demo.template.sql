-- OPTIONAL MANUAL TEST SEED
-- Replace the placeholders before running.
-- This is only for testing before Mollie is connected.

INSERT OR IGNORE INTO customers(email,name)
VALUES ('YOUR_EMAIL@example.com','YOUR NAME');

INSERT INTO purchases(customer_id,product_id,provider,status,purchased_at)
SELECT id,'process-5','manual','paid',CURRENT_TIMESTAMP
FROM customers WHERE email='YOUR_EMAIL@example.com';

INSERT INTO credits(customer_id,product_id,purchase_id,total,remaining,expires_at)
SELECT c.id,'process-5',p.id,5,5,datetime('now','+180 days')
FROM customers c
JOIN purchases p ON p.customer_id=c.id AND p.product_id='process-5'
WHERE c.email='YOUR_EMAIL@example.com'
ORDER BY p.id DESC LIMIT 1;

-- ACCESS TOKEN:
-- Generate a long random token locally.
-- The Worker stores/looks up only SHA-256(token), not the raw token.
-- Insert the SHA-256 hex value below:
INSERT INTO access_tokens(token_hash,customer_id,expires_at)
SELECT 'PASTE_SHA256_HEX_HERE',id,datetime('now','+180 days')
FROM customers WHERE email='YOUR_EMAIL@example.com';
