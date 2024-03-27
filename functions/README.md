# Reverb - Functions Server

This server hosts your application's **Reverb jobs** and contains all the code needed to create these jobs from the provided [template](https://github.com/2401-Team-6/reverb/blob/main/sample/src/index.ts). The jobs will be called from the [Graphile Worker Server](https://github.com/2401-Team-6/reverb/tree/main/workers) which host the [Graphile Worker](https://worker.graphile.org/) runners.

The [Sample Server](https://github.com/2401-Team-6/reverb/tree/main/sample) provides you with an `index.ts` file, which serves as a template where you can define functions and the events or cron-jobs that will trigger these functions. Additionally `index.ts` will boot up the Functions Server.

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

### Running the Functions Server

To initialize the Functions Server in a development environment, from the [Sample Server](https://github.com/2401-Team-6/reverb/tree/main/sample), run:

```
$ npm run dev
```

This will boot up the Functions Server. The Function Server will populate the database with the necessary data and expose the API endpoint the Workers Server uses to send requests to invoke your functions.

### Function Server API
The [Sample Server](https://github.com/2401-Team-6/reverb/tree/main/sample) provides you with an `index.ts` file, where you can find the templates for defining the different kinds of functions.

You define functions with the `createFunction` method. The `createFunction` method takes 1 argument, an `FunctionData` object. There are four properties that can be applied to this object:

1. `id` - This is the unique string identifier for the object
2. `fn` - The function's code
   - Has the type `(event: Event, step: Step) => Promise<any>`
3. `event` - [Optional] If the function is tied to an event, this is the event's name
   - Can not be present with a `cron` property
4. `cron` - [Optional] If the function is tied to a cron, this is the cron string
   - Can not be present with an `event` property
   - Proper format can be found [here](https://worker.graphile.org/docs/cron#crontab-format)

A `FunctionData` must have either an `event` or `cron` property, but not both, for it to be valid.

Inside the `fn` function we provide two parameters. These must always be `await`ed:

1. `event` - The data tied to the event being fired
   - `id` - The unique string ID generated when the event was fired. Is an empty string for a cron.
   - `name` - The name of the event that was fired.
   - `payload` - [Optional] Any data passed with the event when it was fired.
     - `object` type. This will be defined by you and you should check the typing when you run the function.

2. `step` - An object to provide step functionality. It provides these methods:
   1. `run` - `(id: string, callback: () => Promise<any>) => Promise<any>`
      - `id` must be unique
      - `callback` is used to run an individual step.
      - The return value is the return value of the `callback`
   2. `delay` - `(id: string, timePeriod: string) => Promise<any>`
      - `id` must be unique
      - `timePeriod` is the period of time before continuing the function.
        - Can be any combination of number[period] and any number of spaces between
        - period can be `s`(seconds), `m`(minutes), `h`(hours), `d`(days), `w`(weeks), `o`(months)
        - Sample `1d 12h   10m30s` would be 1 day, 12 hours, 10 minutes, and 30 seconds.
   3. `emitEvent` - `(id: string, eventId: string, payload?: object) => Promise<any>`
      - `id` must be unique
      - `eventId` is the event name to be emitted
      - `payload` [Optional] is the payload you wish to pass to the event
   4. `invoke` = `(id: string, invokedFnName: string, payload?: object) => Promise<any>`
      - `id` must be unique
      - `invokedFnName` is the function name to be invoked
      - `payload` [Optional] is the payload you wish to pass to the function via the `event` object

Examples:

```js
const func1 = server.createFunction({
  id: 'first-function',
  event: 'event1',
  fn: async () => {
    console.log('Hello world');
  },
})

const func2 = server.createFunction({
  id: 'second-function',
  cron: 'event1',
  fn: async () => {
    console.log('Hi :)');
  },
})

const func3 = server.createFunction({
  id: 'third-function',
  event: 'event2',
  fn: async (event) => {
    if (
      !!event.payload &&
      'url' in event.payload &&
      typeof event.payload.url === 'string'
    ) {
      fetch(event.payload.url);
    }
  },
})

const func4 = server.createFunction({
  id: 'step-function',
  event: 'event3',
  fn: async (event, step) => {
    await step.run('phone person', async () => console.log('phone person'));
    await step.delay('some delay', '1m30s');
    await step.run('email person', async () => console.log('email person'));
  },
})

const func5 = server.createFunction({
  id: 'function-calls-function',
  event: 'event4',
  fn: async (event, step) => {
    await step.invoke('call 3rd function', 'third-function', {
      url: 'https://enaeajsfdm4b.x.pipedream.net/',
    });
  },
})

const func6 = server.createFunction({
  id: 'emit-event-function',
  event: 'event5',
  fn: async (event, step) => {
    await step.emitEvent('emit-event2', 'event2', {
      url: 'https://enaeajsfdm4b.x.pipedream.net/',
    });
  },
})

const func7 = server.createFunction({
  id: 'cron-function',
  cron: '*/4 * * * *',
  fn: async (event, step) => {
    await step.invoke('call 3rd function', 'third-function', {
      url: 'https://enaeajsfdm4b.x.pipedream.net/',
    });
  },
})

const func8 = server.createFunction({
  id: 'error-function',
  event: 'error',
  fn: async () => {
    throw new Error('This error is for testing purposes');
  },
})

const func9 = server.createFunction({
   id: 'webhook_test',
   event: 'reverb_received_webhook',
   fn: async (event) => {
      console.log(event);
   },
});
```
