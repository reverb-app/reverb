# Reverb - Ingress Server

_Unlike the [Reverb CDK for AWS](https://github.com/reverb-app/reverb-infrastructure), this directory is configured for local development, and thus does not provide any authentication requirements to access its API endpoints. If installing on production servers, make sure to implement any security features your application needs._

This server provides API endpoints for enqueueing your application's **Reverb triggers**, including events and webhooks. It also provides an endpoint for retrieving logs related to your events and workflows. Note that if you are using the [Reverb CDK for AWS](https://github.com/reverb-app/reverb-infrastructure), any changes made to the ingress server must instead be made to the ingress Lambda initialized by that tool, as it is independent from the code in this directory.

## Install

This project uses [node](http://nodejs.org/) and [npm](https://www.npmjs.com/). For local development, simply run:

```sh
$ npm install
```

## Usage

### Environment

To run your ingress server locally, you will first need to configure several environment variables in a `.env` file.

- `GRAPHILE_CONNECTION_STRING` is for connecting with the PostgreSQL database that will host your job queue. This should be the same database to which your functions server and workers server is connected.
  - 👉 [Learn more about configuring your **Reverb functions server**](https://github.com/reverb-app/reverb/blob/main/functions/README.md)
  - 👉 [Learn more about configuring your **Reverb workers server**](https://github.com/reverb-app/reverb/blob/main/workers/README.md)
- `MONGO_CONNECTION_STRING` is for connecting with the MongoDB database that hosts your logs, as the ingress server provides an API endpoint for accessing them. Therefore, this should be the same database that your workers server is connected to. Logging is configured with [winston](https://www.npmjs.com/package/winston).
- Optionally, `PORT` can be set to specify which port the ingress server should run on. It defaults to `3000`.

### Running Your Ingress Server

Before booting your ingress server, verify that your PostgreSQL and MongoDB instances are running. If they are not, the ingress server will crash. For more information on starting these database instances, see the [install instructions for your Reverb workers server](https://github.com/reverb-app/reverb/blob/main/workers/README.md).

To initialize the ingress server in a development environment, run:

```
$ npm run dev
```

### Event API Endpoints

Once running, the ingress server provides the following API endpoints for managing your **Reverb jobs**:

- `/events` is where your **Reverb events** should be sent to to trigger your **Reverb jobs**. This endpoint only accepts `POST` requests, and at minimum it must contain a JSON body with a `name` attribute. If any of your **Reverb functions** associated with that event name require additional parameters, the JSON body must contain a `payload` attribute, which should be an object. This will be accessible as a property on the event object provided as the first argument passed to the callback in your `createFunction` call.
  - 👉 [See our example **Reverb functions**](https://github.com/reverb-app/reverb/blob/main/sample/src/index.ts)
- `/webhooks` is an endpoint you can provide to webhook providers to produce **Reverb jobs** on webhook reception. It will fire a hard-coded **Reverb event** named `reverb_received_webhook`, which can be used as the `event` attribute when creating your functions to fire when a webhook is received. The webhook's data is provided as a `webhook` attribute on the event's `payload`, split into `headers` and `body`. In short, if the event passed to your `createFunction` call is named `event`, the body of a webhook can be accessed via `event.payload.webhook.body` within the `createFunction` callback.
  - 👉 [See our example **Reverb functions**](https://github.com/reverb-app/reverb/blob/main/sample/src/index.ts)

### Logging API Endpoints

Additionally, the ingress server serves as an API for the MongoDB database which hosts your logs. The following are the provided endpoints and their uses. For more information about the query params, see the [query params details table](#query-param-details). Note that this API follows the [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) convention. The data from each endpoint can be accessed on the `logs` property of the returned JSON and links for related resources on each applicable resource or collection can be found on the `links` property.

| Endpoint                  | Logs accessed                                                                                                                      | Allowed query params                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/logs`                   | All logs.                                                                                                                          | <ul><li>**startTime** and **endTime**</li><li>**limit**</li></ul>                                   |
| `/logs/events`            | All events fired, either by a request being sent to the `/events` or `/webhooks` endpoints or those emitted by a **Reverb job**.   | <ul><li>**startTime** and **endTime**</li><li>**limit**</li><li>**page**</li></ul>                  |
| `/logs/functions`         | All functions invoked and their statuses (running, completed, or error).                                                           | <ul><li>**startTime** and **endTime**</li><li>**limit**</li><li>**page**</li><li>**id**</li></ul>   |
| `/logs/events/:eventId`   | All functions invoked by the provided event and their status (running, completed, or error).                                       | <ul><li>None</li></ul>                                                                              |
| `/logs/functions/:funcId` | All logs associated with the provided function, including invocation, **Reverb step** completion, errors, and function completion. | <ul><li>None</li></ul>                                                                              |
| `/logs/errors`            | All error logs.                                                                                                                    | <ul><li>**startTime** and **endTime**</li><li>**limit**</li><li>**page**</li></ul>                  |
| `/logs/dead-letter`       | All failed jobs, including both events and functions.                                                                              | <ul><li>**startTime** and **endTime**</li><li>**limit**</li><li>**page**</li><li>**type**</li></ul> |

### Query Param Details

| Query Param                   | Details                                                                                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **startTime** and **endTime** | A minimum and maximum timestamp between which logs must fall. Both must be provided together and must be formatted in the [date time string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format). |
| **limit**                     | The maximum number of logs to be provided. Defaults to 10.                                                                                                                                                                                                          |
| **page**                      | The page number results should begin on. Page length is determined by the limit param.                                                                                                                                                                              |
| **id**                        | The ID of a function invocation you wish to get the status of. This param can be provided multiple times to get multiple function statuses (for example, `/logs/functions/status?id=example1&id=example2&id=example3`).                                             |
| **type**                      | The type of entry within the dead letter queue you wish to access: `function`, `event`, or `all`. Defaults to `all`. Only used on the `/logs/deadletter` endpoint.                                                                                                  |
