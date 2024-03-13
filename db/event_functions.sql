DROP DATABASE IF EXISTS function_schema;
DROP TABLE IF EXISTS functions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS hash;

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

CREATE TABLE hash (
  hash char(28) UNIQUE NOT NULL DEFAULT ''
);