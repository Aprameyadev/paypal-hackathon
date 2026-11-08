-- PayPilot AI: Seed Data
-- Fictional dataset for testing and Hackathon demonstration

-- Insert Demo Customers
INSERT INTO customers (id, user_id, name, email, company, phone, created_at)
VALUES
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Alex Johnson', 'alex.johnson@techcraft.io', 'TechCraft Studios', '+1 (555) 234-5678', NOW() - INTERVAL '30 days'),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'Sarah Miller', 'sarah@millerconsulting.com', 'Miller Advisory Group', '+1 (555) 345-6789', NOW() - INTERVAL '45 days'),
  ('c1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'John Smith', 'john.smith@smithdesign.co', 'Smith Brand & Design', '+1 (555) 456-7890', NOW() - INTERVAL '60 days'),
  ('c1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'Elena Rostova', 'elena@novafintech.org', 'Nova Fintech Labs', '+1 (555) 567-8901', NOW() - INTERVAL '20 days'),
  ('c1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'David Kim', 'david@apexcloud.dev', 'Apex Cloud Systems', '+1 (555) 678-9012', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Invoices
INSERT INTO invoices (id, user_id, customer_id, invoice_number, description, amount, currency, issue_date, due_date, status, created_at)
VALUES
  ('i1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000001', 'INV-2026-001', 'Website development - Homepage & Responsive Layout', 150.00, 'USD', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '5 days', 'PENDING', NOW() - INTERVAL '10 days'),
  ('i1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000002', 'INV-2026-002', 'Consulting services - Q1 Growth Strategy & Cashflow Audit', 250.00, 'USD', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '5 days', 'OVERDUE', NOW() - INTERVAL '25 days'),
  ('i1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000003', 'INV-2026-003', 'Design services - Brand Identity & UI Kit Delivery', 100.00, 'USD', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '10 days', 'PAID', NOW() - INTERVAL '30 days'),
  ('i1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000004', 'INV-2026-004', 'API Integration & Security Audit', 420.00, 'USD', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '8 days', 'PENDING', NOW() - INTERVAL '12 days'),
  ('i1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000005', 'INV-2026-005', 'Cloud Infrastructure Optimization & Terraform Scripts', 350.00, 'USD', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '20 days', 'PAID', NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Transactions
INSERT INTO transactions (id, user_id, invoice_id, paypal_order_id, paypal_capture_id, amount, currency, status, payment_source, created_at)
VALUES
  ('t1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'i1000000-0000-0000-0000-000000000003', 'DEMO_ORDER_78901', 'DEMO_CAP_78901', 100.00, 'USD', 'COMPLETED', 'PAYPAL', NOW() - INTERVAL '10 days'),
  ('t1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'i1000000-0000-0000-0000-000000000005', 'DEMO_ORDER_99124', 'DEMO_CAP_99124', 350.00, 'USD', 'COMPLETED', 'PAYPAL', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;
