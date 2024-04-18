# Reverb

Reverb is an open-source, **event-driven, asynchronous workflow engine** that abstracts away the logic and infrastructure developers need to orchestrate complex background tasks. Users define tasks as multi-step functions in their repository, and Reverb handles triggering and executing them step-by-step. The service is self-hosted on [Amazon Web Services (AWS)](https://aws.amazon.com/) and is deployable with one command using our CLI tool.

Please check out our [website](https://reverb-app.github.io) to learn more!

## Deploying & Using Reverb

There are three steps to fully deploying Reverb.

1. Deploy base infrastructure
2. Script functions
3. Deploy function server

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

Inside the template, there is a sample of how to make functions along with a README that describes how to do so. There is a `docker compose` available to test your function server locally. Functionality is all up to the individual developer. Once you are done we can move on to the next step.

### Deploy Function Server

You just need to follow these steps:

1. Create a GitHub repository for your function server

2. Set up some secrets in the GitHub repository:

- **DOCKER_USER** is your Docker Hub username.
- **DOCKER_PASS** is your Docker Hub access key.
- **DOCKER_TAG** is the tagname you wish to give your function servers image (**\<USER\>\/\<APP\>** is the usual format).
- **AWS_ACCESS_KEY_ID** is the access key for an AWS IAM account with _lambda:InvokeFunction allowed_. Preferably, that being its only permission.
- **AWS_SECRET_ACCESS_KEY** is the secret key tied to the above access key.
- **UPDATE_LAMBDA_NAME** is the Lambda name output by the reverb-cli tool when it deploys. You can use the command `reverb-cli api:show` to retrieve this information at a later time.
- **ENVIRONMENT** being a JSON formatted array of environmental variable objects. If you have no needed environmental variables, please set this to `[]`.

3. Push your function server code to the main branch of the github repository.

By pushing to a GitHub repository with the above secrets in place, the GitHub action should fire and automate the deployment of your function server. You may also run the action manually. Each updated version of the server just needs to be pushed to main for it to redeploy.

## Reverb's Three Node Pattern

Reverb’s functionality is organized in a three-node pattern. The three nodes are the [**Ingress Server**](https://github.com/reverb-app/reverb/tree/main-readme/ingress), the [**Graphile Workers Server**](https://github.com/reverb-app/reverb/tree/main-readme/workers) and the [**Functions Server**](https://github.com/reverb-app/reverb/tree/main-readme/functions).

### Ingress Server

**Unlike the [Reverb CDK for AWS](https://github.com/reverb-app/reverb-infrastructure), This directory is configured for local development, and thus does not provide any authentication requirements to access its API endpoints. If installing on production servers, make sure to implement any security features your application needs.**

This server provides API endpoints for enqueueing your application's **Reverb jobs**, including events and webhooks. It also provides an endpoint for retrieving logs related to said jobs. Note that if you are using the [Reverb CDK for AWS](https://github.com/reverb-app/reverb-infrastructure), any changes made to the ingress server must instead be made to the ingress Lambda initialized by that tool, as it is independent from the code in this directory.

- 👉 [Learn more about configuring your **Reverb Ingress Server**](https://github.com/reverb-app/reverb/blob/main-readme/ingress/README.md).

### Graphile Workers Server

This server hosts Graphile Worker runners that are responsible for managing your Postgres job queue and processing your application's **Reverb jobs**. These include jobs triggered by events, cron, or steps within the Reverb step functions you've defined in your codebase.

- 👉 [Learn more about configuring your **Reverb Workers Server**](https://github.com/reverb-app/reverb/blob/main/workers/README.md)

### Functions Server

This server hosts your application's **Reverb jobs** and contains all the code needed to create these jobs from the provided [template](https://github.com/reverb-app/reverb/blob/main/sample/src/index.ts). The jobs will be called from the [Graphile Worker Server](https://github.com/reverb-app/reverb/tree/main/workers) which host the [Graphile Worker](https://worker.graphile.org/) runners.

The [Sample Server](https://github.com/reverb-app/reverb/blob/main/sample) provides you with an `index.ts` file, which serves as a template where you can define functions and the events or cron-jobs that will trigger these functions. Additionally `index.ts` will boot up the Functions Server.

A function can be a single function invocation or can be comprised of different steps. Each step will need to be awaited.

A step can be run, delayed, invoked, or emit an event.

- 👉 [Learn more about configuring your **Reverb Functions Server**](https://github.com/reverb-app/reverb/blob/main/functions/README.md)
