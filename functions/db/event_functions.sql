DROP TABLE IF EXISTS functions;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id serial PRIMARY KEY,
  name varchar(30) UNIQUE NOT NULL
);

CREATE TABLE functions (
  id serial PRIMARY KEY,
  name varchar(30) UNIQUE NOT NULL,
  event_id integer REFERENCES events(id) ON DELETE CASCADE
);