-- Populate employee table
INSERT INTO employee (id, first_name, last_name, email, department, hire_date) VALUES
  ('emp-001', 'Alice', 'Smith', 'alice.smith@companyx.com', 'HR', '2021-03-15'),
  ('emp-002', 'Bob', 'Johnson', 'bob.johnson@companyx.com', 'Engineering', '2020-07-22'),
  ('emp-003', 'Carol', 'Lee', 'carol.lee@companyx.com', 'Finance', '2019-11-01');

-- Populate certificate table
INSERT INTO certificate (id, employee_id, type, issue_date, expiry_date, document_url) VALUES
  ('cert-001', 'emp-001', 'Safety Training', '2023-01-10', '2025-01-10', '/files/cert-001.pdf'),
  ('cert-002', 'emp-002', 'First Aid', '2022-06-15', '2024-06-15', '/files/cert-002.pdf');

-- Populate requirement table
INSERT INTO requirement (id, name, description, is_mandatory) VALUES
  ('req-001', 'Background Check', 'Annual background screening', 1),
  ('req-002', 'Annual Health Check', 'Yearly health assessment', 1),
  ('req-003', 'Cybersecurity Training', 'Online security awareness', 0);

-- Populate employee_requirement table
INSERT INTO employee_requirement (id, employee_id, requirement_id, status, due_date, fulfilled_date, document_url) VALUES
  ('er-001', 'emp-001', 'req-001', 'fulfilled', '2024-03-15', '2024-03-10', '/files/bgcheck-alice.pdf'),
  ('er-002', 'emp-001', 'req-002', 'pending', '2025-03-15', NULL, NULL),
  ('er-003', 'emp-002', 'req-001', 'overdue', '2023-07-22', NULL, NULL),
  ('er-004', 'emp-003', 'req-002', 'fulfilled', '2024-11-01', '2024-10-30', '/files/health-carol.pdf');

-- Populate document table
INSERT INTO document (id, employee_id, type, file_url, upload_date) VALUES
  ('doc-001', 'emp-001', 'Signed Policy', '/files/policy-alice.pdf', '2024-01-05'),
  ('doc-002', 'emp-002', 'Proof of Compliance', '/files/compliance-bob.pdf', '2023-08-01');
