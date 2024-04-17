# Reverb

Reverb is an open-source, **event-driven, asynchronous workflow engine** that abstracts away the logic and infrastructure developers need to orchestrate complex background tasks. Users define tasks as multi-step functions in their repository, and Reverb handles triggering and executing them step-by-step. The service is self-hosted on [Amazon Web Services (AWS)](https://aws.amazon.com/) and is deployable with one command using our CLI tool.

Please check out our [website]() to learn more!

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



