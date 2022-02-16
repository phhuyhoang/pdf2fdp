
-- Create database
CREATE DATABASE pdf2fdp;
CREATE DATABASE pdf2fdp_test;
-- Grant multiple privileges
GRANT CREATE, DROP, DELETE, PROCESS, INSERT, SELECT, UPDATE ON pdf2fdp.* TO 'publicuser'@'localhost';
GRANT CREATE, DROP, DELETE, PROCESS, INSERT, SELECT, UPDATE ON pdf2fdp_test.* TO 'publicuser'@'localhost';
-- Allow backup
GRANT PROCESS ON *.* TO 'publicuser'@'localhost';
