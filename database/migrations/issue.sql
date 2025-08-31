-- Create the table
CREATE TABLE issue (
    id NUMBER PRIMARY KEY,
    citizen_name VARCHAR2(255) NOT NULL,
    citizen_email VARCHAR2(255) NOT NULL,
    citizen_phone VARCHAR2(50),
    citizen_address VARCHAR2(255),
    title VARCHAR2(255) NOT NULL,
    description CLOB NOT NULL,
    category VARCHAR2(100) NOT NULL,
    priority VARCHAR2(10) DEFAULT 'medium',
    location VARCHAR2(255) NOT NULL,
    image_url VARCHAR2(500),
    status VARCHAR2(20) DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a sequence for auto-increment ID
CREATE SEQUENCE issue_seq START WITH 1 INCREMENT BY 1 NOCACHE;

-- Trigger to auto-populate the ID
CREATE OR REPLACE TRIGGER issue_before_insert
BEFORE INSERT ON issue
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    :NEW.id := issue_seq.NEXTVAL;
  END IF;
END;
/
