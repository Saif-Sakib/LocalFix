-- LocalFix Database Setup Script (Minimal Version)
-- Save as: database/000_database_setup.sql
-- Compatible with SQL Developer, Toad, and other Oracle clients

-- Enable necessary Oracle session settings
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF3';

-- Create tablespace for LocalFix (optional - adjust paths as needed)
-- Uncomment if you want a dedicated tablespace
/*
CREATE TABLESPACE localfix_data
DATAFILE 'C:\oracle\oradata\xe\localfix_data.dbf'
SIZE 100M
AUTOEXTEND ON
NEXT 10M
MAXSIZE UNLIMITED;

CREATE TABLESPACE localfix_index
DATAFILE 'C:\oracle\oradata\xe\localfix_index.dbf'
SIZE 50M
AUTOEXTEND ON
NEXT 5M
MAXSIZE UNLIMITED;
*/

-- Create database user for LocalFix application (optional)
-- Uncomment and modify as needed
/*
CREATE USER localfix_user IDENTIFIED BY localfix123
DEFAULT TABLESPACE localfix_data
TEMPORARY TABLESPACE temp;

GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE SEQUENCE, CREATE TRIGGER TO localfix_user;
GRANT UNLIMITED TABLESPACE TO localfix_user;
*/

-- Simple verification query instead of DBMS_OUTPUT
SELECT 
    'LocalFix Database Setup Complete' as status,
    SYS_CONTEXT('USERENV', 'DB_NAME') as database_name,
    USER as current_user,
    SYS_CONTEXT('USERENV', 'SESSION_USER') as session_user,
    TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') as setup_time
FROM dual;

-- Commit the session changes
COMMIT;