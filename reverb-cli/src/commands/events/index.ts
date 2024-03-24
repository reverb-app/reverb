import chalk from "chalk";
import { ApiCommand } from "../../apiCommand.js";
import { EventFiredLog } from "../../types/types.js";

export default class Events extends ApiCommand<typeof Events> {
  static description = "Get events that have occured";

  static examples = [
    `$ <%= config.bin %> events -u https://example.com
${chalk.greenBright(
  "event1"
)} | 28268a12-9668-4b92-ad77-9bfd8801222a | ${chalk.yellow(
      "Sun, 24 Mar 2024 00:14:41 GMT"
    )}
`,
  ];

  async run(): Promise<void> {
    const url = await this.getUrl();

    const end = this.getEndTime();
    const start = this.getStartTime();

    let data: EventFiredLog[];
    try {
      const res = await fetch(
        url + `/logs/events?limit=-1&startTime=${start}&endTime=${end}`
      );
      data = await res.json();
    } catch {
      this.error(`Issue getting data from ${chalk.red(url)}.`);
    }

    this.log(
      `Showing events from ${chalk.yellow(start)} to ${chalk.yellow(end)}:\n`
    );

    if (data.length === 0) {
      this.warn("No events in the given timeframe");
    }

    for (const log of data) {
      const timestamp = new Date(log.timestamp).toUTCString();
      const { eventId, eventName } = log.meta;
      this.log(
        `${chalk.greenBright(eventName)} | ${eventId} | ${chalk.yellow(
          timestamp
        )} `
      );
    }
  }
}
