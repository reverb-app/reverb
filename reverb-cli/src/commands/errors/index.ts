import chalk from "chalk";
import { ApiCommand } from "../../api-command.js";
import { Flags } from "@oclif/core";

export default class Errors extends ApiCommand<typeof Errors> {
  static description = "Get events that have occured within a time period";

  static examples = [
    `$ <%= config.bin %> events -u https://example.com
${chalk.greenBright(
  "event1"
)} | 28268a12-9668-4b92-ad77-9bfd8801222a | ${chalk.yellow(
      "Sun, 24 Mar 2024 00:14:41 GMT"
    )}
`,
  ];

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
    const url = this.getUrl();
    const key = this.getKey();

    let data: { logs: { error: any }[] };

    try {
      const res = await fetch(url + `/logs/errors`, {
        headers: { "x-api-key": key },
      });

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

      data = await res.json();
    } catch {
      this.error(`${chalk.red("[FAIL]")} Cannot connect to ${url}.`);
    }

    this.log(
      `${chalk.greenBright("[Success]")} Showing most recent ${chalk.red(
        "errors"
      )}:\n`
    );

    if (data.logs.length === 0) {
      this.warn("There are no errors to show");
    }

    for (const log of data.logs) {
      this.logJson(log.error);
      this.log();
    }
  }
}
