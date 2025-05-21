-- Vizier Database Schema (SQLite)

CREATE TABLE employee (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    hire_date TEXT -- store as ISO8601 string
);

CREATE TABLE certificate (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    employee_id TEXT REFERENCES employee(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    issue_date TEXT,
    expiry_date TEXT,
    document_url TEXT
);

CREATE TABLE requirement (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    name TEXT NOT NULL,
    description TEXT,
    is_mandatory INTEGER NOT NULL -- 0/1 for boolean
);

CREATE TABLE employee_requirement (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    employee_id TEXT REFERENCES employee(id) ON DELETE CASCADE,
    requirement_id TEXT REFERENCES requirement(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'fulfilled', 'overdue')),
    due_date TEXT,
    fulfilled_date TEXT,
    document_url TEXT
);

CREATE TABLE document (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    employee_id TEXT REFERENCES employee(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    file_url TEXT,
    upload_date TEXT
);

-- ComplianceStatus is a computed view, not a table.
