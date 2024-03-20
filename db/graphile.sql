DROP DATABASE IF EXISTS graphile;
CREATE DATABASE graphile;

\c graphile

DROP TABLE IF EXISTS functions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS hash;

CREATE TABLE events (
  id serial PRIMARY KEY,
  name varchar(50) UNIQUE NOT NULL
);

CREATE TABLE functions (
  id serial PRIMARY KEY,
  name varchar(50) UNIQUE NOT NULL,
  event_id integer REFERENCES events(id) ON DELETE CASCADE,
  cron varchar(100)
);

CREATE TABLE hash (
  hash char(28) UNIQUE NOT NULL DEFAULT ''
);