DROP DATABASE IF EXISTS function_schema;
DROP TABLE IF EXISTS functions;
DROP TABLE IF EXISTS events;

CREATE DATABASE function_schema;
\c function_schema

CREATE TABLE events (
  id serial PRIMARY KEY,
  name varchar(30) UNIQUE NOT NULL
);

CREATE TABLE functions (
  id serial PRIMARY KEY,
  name varchar(30) UNIQUE NOT NULL,
  event_id integer REFERENCES events(id) ON DELETE CASCADE
);