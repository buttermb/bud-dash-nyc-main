-- Delete all data from tables with foreign keys to users
DELETE FROM audit_logs;
DELETE FROM error_logs;
DELETE FROM application_logs;
DELETE FROM chat_sessions;
DELETE FROM admin_audit_logs;
DELETE FROM admin_sessions;
DELETE FROM security_events;
DELETE FROM fraud_flags;
DELETE FROM device_fingerprints;
DELETE FROM user_ip_addresses;
DELETE FROM loyalty_transactions;
DELETE FROM giveaway_referrals;
DELETE FROM giveaway_entries;
DELETE FROM giveaway_queue;
DELETE FROM user_welcome_discounts;
DELETE FROM coupon_usage;
DELETE FROM reviews;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM addresses;
DELETE FROM profiles;
DELETE FROM admin_users;

-- Finally delete all auth users
DELETE FROM auth.users;