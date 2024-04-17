# reverb-cli

As part of the [Reverb](https://github.com/reverb-app/reverb) project, this is a cli tool for interacting with it. This tool will allow you to emit events, read and filter logs, and even deploy Reverb to AWS.

## Usage

To install reverb-cli, you must run this command:

```
npm install -g @reverb-app/cli
```

This will install the cli app globally so you can run commands with it. There are a number of topics and commands you can use. The folowing sections will be each topic and list the commands that can be used.

### api

The api topic is used for configuring the global api configuration. While you can use flags to set this per command, it is generally useful to set a global default for all commands.

#### `api:get`

```
> reverb-cli api:get
{
  "apiUrl": "http://localhost:3001",
  "lambdaName": "reverb-stack-reverbupdatelambda",
  "apiKey": "your-api-key"
}

```

The `api:get` command will display your currently set api settings. Only apiUrl and apiKey are manually settable.

#### `api:set-key`

```
> reverb-cli api:set-key <key-value>
[Success]
```

The `api:set-key` command allows you to set the default api key you want to use when interacting with the API.

#### `api:set-url`

```
> reverb-cli api:set-url <url-to-your-api>
[Success]
```

The `api:set-url` command allows you to set the default api url you want to use when interacting with the API.

### `cdk`

The `cdk` topic holds commands to interact with the [Reverb CDK Project](https://github.com/reverb-app/reverb-infrastructure) to deploy or destroy a Reverb deployment. To use any command from this topic requires a few things to be done first:

1. [Sign into the AWS CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_auth)
2. [Install the CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
3. [Bootstrap the CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_bootstrap)

#### `cdk:deploy`

```
> reverb-cli cdk:deploy
```

The `cdk:deploy` command deploys the basic infrastructure needed by Reverb to your AWS account.

#### `cdk:destroy`

```
> reverb-cli cdk:destroy
```

The `cdk:destroy` command completely removes Reverb from your AWS account. This will not leave any backups, it is a total removal.

### `dlq`

The `dlq` topic is also the only command tied to it. It is used to interact with Reverb's dead letter queue logs. These logs show what functions never completed and give you metadata about them so that you can track down what went wrong.

```
> reverb-cli dlq [-u url-to-api] [-k api-key-value] [-e end-time-filter] [-s start-time-filter]
```

As said above, the `dlq` command shows a filtered list of jobs that were not able to be completed. There are a number of flags you can use with this command:

- `-u`: Specify the url to the api you wish to connect
- `-k`: Specify the key to the api you wish to connect. Typically used only with the `-u` flag on a non-default api.
- `-e`: Specify the end date/time for the query.
  - Defaults to now
  - Must be parsable as a Javascript Datestring ([see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format))
- `-s`: Specify the start date/time for the query.
  - Defaults to 7 days prior to the end date/time
  - Must be parsable as a Javascript Datestring ([see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format))

### `errors`

The `errors` topic is also the only command tied to it.

```
> reverb-cli errors [-u url-to-api] [-k api-key-value] [-e end-time-filter] [-s start-time-filter]
```

The `errors` command shows a filtered list of error logs in a json format from the specific time period given.

- `-u`: Specify the url to the api you wish to connect
- `-k`: Specify the key to the api you wish to connect. Typically used only with the `-u` flag on a non-default api.
- `-e`: Specify the end date/time for the query.
  - Defaults to now
  - Must be parsable as a Javascript Datestring ([see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format))
- `-s`: Specify the start date/time for the query.
  - Defaults to 7 days prior to the end date/time
  - Must be parsable as a Javascript Datestring ([see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format))

### `events`

The `events` topic contains commands that allow you to emit events, view events, and view all functions tied to a specific event.

#### `events`

```
> reverb-cli events [-u url-to-api] [-k api-key-value] [-e end-time-filter] [-s start-time-filter] [-n name-of-event]
event1 | 28268a12-9668-4b92-ad77-9bfd8801222a | Sun, 24 Mar 2024 00:14:41 GMT
```

The `events` command is used to lookup all events that fired within a specific time period and/or with a specific name. The output is separated into `name` | `id` | `time`. There are a number of flags you can use with this command:

- `-u`: Specify the url to the api you wish to connect
- `-k`: Specify the key to the api you wish to connect. Typically used only with the `-u` flag on a non-default api.
- `-e`: Specify the end date/time for the query.
  - Defaults to now
  - Must be parsable as a Javascript Datestring ([see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format))
- `-s`: Specify the start date/time for the query.
  - Defaults to 7 days prior to the end date/time
  - Must be parsable as a Javascript Datestring ([see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format))
- `-n`: Specify the name of the event to be filtered.

#### `events:emit`

```
> reverb-cli events:emit [-u url-to-api] [-k api-key-value] name-of-event ['{"description": "Optional JSON formatted payload for event"}']
[Success]
```

The `events:emit` command is used to emit a `name-of-event` event to the api for Reverb to process. You may optionally pass a JSON formatted payload to be sent when emitting the event. There are a number of flags you can use with this command:

- `-u`: Specify the url to the api you wish to connect
- `-k`: Specify the key to the api you wish to connect. Typically used only with the `-u` flag on a non-default api.

#### `events:status`

```
> reverb-cli events:status [-u url-to-api] [-k api-key-value] id-of-event
🟢test-function | 00000000-ffff-aaaa-ffff-999999999999 | Sun, 24 Mar 2024 00:14:41 GMT
```

The `events:status` command gives you a run down of all functions fired by the specific event with `id-of-event` in the format ` [status-emoji]``function-name ` | `invocation-id` | `last-updated-time`. There are a number of flags you can use with this command:

- `-u`: Specify the url to the api you wish to connect
- `-k`: Specify the key to the api you wish to connect. Typically used only with the `-u` flag on a non-default api.

### `functions`

The `functions` topic contains commands to view invoked functions and view logs tied to specific function invocations.

#### `functions`

```
> reverb-cli functions [-u url-to-api] [-k api-key-value] [-e end-time-filter] [-s start-time-filter] [-n name-of-event]
[Success] Showing functions from 2024-03-17T06:56:05.332Z to 2024-03-24T06:56:05.332Z:

cron-function | f622f15c-d759-4455-88dc-63c51c748336 | Sun, 24 Mar 2024 06:24:00 GMT | Sun, 24 Mar 2024 06:24:00 GMT
```

The `functions` command shows all functions invoked within the filters guidelines. The output is structured `function-name` | `invocation-id` | `invoked-time` | `last-update-time`. There are a number of flags you can use with this command:

- `-u`: Specify the url to the api you wish to connect
- `-k`: Specify the key to the api you wish to connect. Typically used only with the `-u` flag on a non-default api.
- `-e`: Specify the end date/time for the query.
  - Defaults to now
  - Must be parsable as a Javascript Datestring ([see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format))
- `-s`: Specify the start date/time for the query.
  - Defaults to 7 days prior to the end date/time
  - Must be parsable as a Javascript Datestring ([see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format))
- `-n`: Specify the name of the function to be filtered.

#### `functions:logs`

```
> reverb-cli functions:logs [-u url-to-api] [-k api-key-value] invocation-id
```

The `functions:logs` command retrieves all JSON formatted logs for a function invocation with the id `invocation-id`. There are a number of flags you can use with this command:

- `-u`: Specify the url to the api you wish to connect
- `-k`: Specify the key to the api you wish to connect. Typically used only with the `-u` flag on a non-default api.
