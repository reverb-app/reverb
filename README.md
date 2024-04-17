# Reverb

Reverb is an open-source, **event-driven, asynchronous workflow engine** that abstracts away the logic and infrastructure developers need to orchestrate complex background tasks. Users define tasks as multi-step functions in their repository, and Reverb handles triggering and executing them step-by-step. The service is self-hosted on [Amazon Web Services (AWS)](https://aws.amazon.com/) and is deployable with one command using our CLI tool.

## Deploying & Using Reverb

There are three steps to fully deploying Reverb.

1. Deploy base infrastructure
2. Script functions
3. Deploy function server

This project uses [node](http://nodejs.org/) and [npm](https://www.npmjs.com/). For local development, simply run:

```sh
$ npm install
```

### Deploying Base Infrastructure

This project uses [node](http://nodejs.org/) and [npm](https://www.npmjs.com/).

To deploy the base infrastructure just follow these steps:

1. Follow this [guide](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) to getting started with the CDK. This will have you:
   
- [Sign into the AWS CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_auth)
- [Install the CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
- [Bootstrap the CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_bootstrap)

2. Download the Reverb cli tool with the command:

```sh
$ npm install -g @reverb-app/cli
```

3. Run the command:

```sh
$ reverb-cli cdk:deploy
```

By following the above steps, the reverb-cli will download the Reverb’s CDK project and deploy it to your aws account. This will deploy an empty function server as well, which you will need to replace.


