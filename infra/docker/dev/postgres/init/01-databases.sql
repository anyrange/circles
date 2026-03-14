SELECT 'CREATE ROLE circles LOGIN PASSWORD ''password'''
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'circles')\gexec

SELECT 'CREATE DATABASE circles_dev OWNER circles'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'circles_dev')\gexec
