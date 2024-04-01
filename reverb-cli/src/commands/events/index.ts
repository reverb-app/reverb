import chalk from "chalk";
import { ApiCommand } from "../../api-command.js";
import { EventFiredLog } from "../../types/types.js";
import { Errors, Flags } from "@oclif/core";

export default class Events extends ApiCommand<typeof Events> {
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
    name: Flags.string({
      char: "n",
      description: "Filter by event name",
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Events);
    const url = this.getUrl();
    const key = this.getKey();

    const end = this.getEndTime();
    const start = this.getStartTime();

    let data: { logs: { event: EventFiredLog }[] };
    try {
      const nameQuery = flags.name ? "&name=" + flags.name : "";
      const res = await fetch(
        url +
          `/logs/events?limit=-1&startTime=${start}&endTime=${end}${nameQuery}`,
        {
          headers: { "x-api-key": key },
        }
      );

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
      `${chalk.greenBright("[Success]")} Showing events from ${chalk.yellow(
        start
      )} to ${chalk.yellow(end)}:\n`
    );

    if (data.logs.length === 0) {
      this.warn("No events in the given timeframe");
    }

    for (const { event } of data.logs) {
      const timestamp = new Date(event.timestamp).toUTCString();
      const { eventId, eventName } = event.meta;
      this.log(
        `${chalk.greenBright(eventName)} | ${eventId} | ${chalk.yellow(
          timestamp
        )} `
      );
    }
  }
}
