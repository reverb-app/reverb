# Reverb - Functions Server

This server hosts your application's **Reverb jobs** and contains all the code needed to create these jobs from the provided [template] (https://github.com/2401-Team-6/reverb/blob/main/sample/src/index.ts). The jobs will be called from the [Graphile Worker Server] (https://github.com/2401-Team-6/reverb/tree/main/workers) which host the [Graphile Worker](https://worker.graphile.org/) runners.

The [Sample Server] [https://github.com/2401-Team-6/reverb/tree/main/sample] provides you with an `index.ts` file, which serves as a template where you can define functions and the events or cron-jobs that will trigger these functions. Additionally `index.ts` will boot up the Functions Server.

A function can be a single function invocation or can be comprised of different steps. Each step will need to be awaited.

A step can be run, delayed, invoked, or emit an event.

## Install

This project uses [node](http://nodejs.org/) and [npm](https://www.npmjs.com/). For local development, simply run:

```sh
$ npm install
```

## Usage

### Environment
To run the Functions Server locally, you will first need to configure several environment variables in a `.env` file.
- `GRAPHILE_CONNECTION_STRING` is for connecting with the PostgreSQL database that will host your job queue. This should be the same database to which your workers server is connected.
- `PORT` is the port the functions server will be listening on. This is usually 3002. 

### Any optional sections

## API

### Any optional sections

## More optional sections

## Contributing

See [the contributing file](CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

### Any optional sections

## License

[MIT © Richard McRichface.](../LICENSE)