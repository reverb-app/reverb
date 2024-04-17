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

### Script Functions

To download the template project, run the command:

```sh
$ npm create reverb <app-name>
```
`<app-name>` is whatever directory name you want it to be stored in. This command will download the template project for you. 

Change directories to `<app-name>` and then run:

```sh
npm install
```

This will install the dependencies of the application.

Inside the template, there is a sample of how to make functions along with a README that describes how to do so. There is a `docker compose` available  to test your function server locally.  Functionality is all up to the individual developer. Once you are done we can move on to the next step.

