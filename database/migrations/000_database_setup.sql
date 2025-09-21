-- Create Dedicated User
-- Run these commands using the system credentials:

-- To drop user: 
DROP USER local CASCADE;

CREATE USER local IDENTIFIED BY fix;

-- Minimum privileges for app development
GRANT CREATE SESSION TO local;
GRANT CREATE TABLE TO local;
GRANT CREATE SEQUENCE TO local;
GRANT CREATE TRIGGER TO local;
GRANT CREATE VIEW TO local;
GRANT CREATE PROCEDURE TO local;
GRANT UNLIMITED TABLESPACE TO local;

-- If you want to revoke later for stricter security post-deployment,
-- REVOKE CREATE PROCEDURE FROM local;