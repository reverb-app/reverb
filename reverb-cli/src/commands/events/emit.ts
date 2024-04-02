import chalk from "chalk";
import { ApiCommand } from "../../api-command.js";
import { Args, Flags } from "@oclif/core";

export default class Emit extends ApiCommand<typeof Emit> {
  static args = {
    eventName: Args.string({
      description: "Name of the event to emit",
      required: true,
    }),
    payload: Args.string({
      description:
        "The JSON formatted string payload to pass to the event encased in single quotes",
      required: false,
    }),
  };

  static description = "Emits an event to your Reverb Server";

  static flags = {
    apiUrl: Flags.string({
      char: "u",
      description: "The url to the api gateway for this call",
      required: false,
    }),
    apiKey: Flags.string({
      char: "k",
      description: "API key that goes with the api url.",
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Emit);

    const url = this.getUrl();
    const key = this.getKey();

    let payload: any = undefined;
    if (args.payload) {
      try {
        payload = JSON.parse(args.payload);
      } catch {
        this.error(`${chalk.red("[FAIL]")} Payload is not propper JSON`);
      }
    }

    try {
      const res = await fetch(url + "/events", {
        method: "POST",
        headers: { "x-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ name: args.eventName, payload }),
      });

      if (res.status === 400) {
        this.warn(`${chalk.red("[FAIL]")} Something is wrong with input.`);
        throw "error";
      }

      if (res.status === 500) {
        this.warn(
          `${chalk.red("[FAIL]")} Internal Server Error, try again later`
        );
        throw "error";
      }

      if (res.status === 403) {
        this.warn(
          `${chalk.red(
            "[FAIL]"
          )} API Key invalid, please provide correct API Key`
        );
        throw "error";
      }
    } catch {
      this.error(`${chalk.red("[FAIL]")} Cannot connect to ${url}.`);
    }

    this.log(chalk.greenBright("[Success]"));
  }
}
