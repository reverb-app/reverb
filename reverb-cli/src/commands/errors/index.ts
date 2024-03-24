import chalk from "chalk";
import { ApiCommand } from "../../apiCommand.js";
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
  };

  async run(): Promise<void> {
    const url = await this.getUrl();

    let data: any[];

    try {
      const res = await fetch(url + `/logs/errors`);

      if (res.status === 500) {
        this.error(
          `${chalk.red("[FAIL]")} Internal Server Error, try again later`
        );
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

    for (const error of data) {
      this.logJson(error);
      this.log();
    }
  }
}
