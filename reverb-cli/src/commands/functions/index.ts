import chalk from "chalk";
import { ApiCommand } from "../../apiCommand.js";
import { FuncStatus } from "../../types/types.js";
import { getEmoji } from "../../utils/utils.js";
import { Flags } from "@oclif/core";

export default class Functions extends ApiCommand<typeof Functions> {
  static description = "Get functions that have occured within a time period";

  static examples = [
    `$ <%= config.bin %> functions -u https://example.com
[Success] Showing functions from 2024-03-17T06:56:05.332Z to 2024-03-24T06:56:05.332Z:

🟢${chalk.greenBright(
      "cron-function"
    )} | f622f15c-d759-4455-88dc-63c51c748336 | ${chalk.yellowBright(
      "Sun, 24 Mar 2024 06:24:00 GMT"
    )} | ${chalk.yellow("Sun, 24 Mar 2024 06:24:00 GMT")}`,
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
    start: Flags.string({
      char: "s",
      description:
        "Start Time for logs to get in a javascript parsable format(Defaults to 7 day prior to end)",
      required: false,
    }),
    end: Flags.string({
      char: "e",
      description:
        "End Time for logs to get in a javascript parsable format(Defaults to now)",
      required: false,
    }),
  };

  async run(): Promise<void> {
    const url = this.getUrl();
    const key = this.getKey();

    const end = this.getEndTime();
    const start = this.getStartTime();

    let data: { logs: { function: FuncStatus }[] };
    try {
      const res = await fetch(
        url + `/logs/functions?limit=-1&startTime=${start}&endTime=${end}`,
        {
          headers: { "x-api-key": key },
        }
      );

      if (res.status === 500) {
        this.error(
          `${chalk.red("[FAIL]")} Internal Server Error, try again later`
        );
      }

      if (res.status === 403) {
        this.error(
          `${chalk.red(
            "[FAIL]"
          )} API Key invalid, please provide correct API Key`
        );
      }

      data = await res.json();
    } catch {
      this.error(`${chalk.red("[FAIL]")} Cannot connect to ${url}.`);
    }

    this.log(
      `${chalk.greenBright("[Success]")} Showing functions from ${chalk.yellow(
        start
      )} to ${chalk.yellow(end)}:\n`
    );

    if (data.logs.length === 0) {
      this.warn("No function calls in the given timeframe");
    }

    for (const { function: fn } of data.logs) {
      const { funcId, funcName, lastUpdate, invoked, status } = fn;
      const emoji = getEmoji(status);
      const time = new Date(lastUpdate).toUTCString();
      const inv = new Date(invoked).toUTCString();

      this.log(
        `${emoji}${chalk.greenBright(
          funcName
        )} | ${funcId} | ${chalk.yellowBright(inv)} | ${chalk.yellow(time)}`
      );
    }
  }
}
