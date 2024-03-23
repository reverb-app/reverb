# Reverb - Graphile Workers Server

This server hosts [Graphile Worker](https://worker.graphile.org/) runners that are responsible for managing your Postgres job queue and processing your application's **Reverb jobs**. These include jobs triggered by events, cron, or steps within the **Reverb step functions** you've defined in your codebase.

## Install

This project uses [node](http://nodejs.org/) and [npm](https://www.npmjs.com/). For local development, simply run:

```sh
$ npm install
```

## Usage

### Environment

To run your Graphile workers locally, you will first need to configure several environment variables in a `.env` file.

- `GRAPHILE_CONNECTION_STRING` is for connecting with the PostgreSQL database that will host your job queue. This should be the same database to which your functions server is connected.
  - 👉 [Learn more about configuring your **Reverb functions server**]()
  - ^^**_LINK TO FUNCTIONS SERVER ON GH_**
- `FUNCTION_SERVER_URL` configures the HTTP endpoint where the workers should send [JSON-RPC](https://www.jsonrpc.org/specification) requests to invoke your functions. This will most likely be `http://localhost:3002/calls`
- `MONGO_CONNECTION_STRING` is for logging event, function, job, and error data to a MongoDB database. Logging is configured with [winston](https://www.npmjs.com/package/winston).

### Running Graphile Worker

To initialize the Graphile workers in a development environment, run:

```
$ npm run dev
```

If the database has not yet been populated with the necessary data from your **Reverb functions server** codebase, your terminal will read:

```sh
Waiting for functions data to populate in the database...
```

Once the database is populated, your workers will be ready and able to dequeue and process jobs!
