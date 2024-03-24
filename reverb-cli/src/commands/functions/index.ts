import chalk from "chalk";
import { ApiCommand } from "../../apiCommand.js";
import { FuncStatus } from "../../types/types.js";
import { getEmoji } from "../../utils/utils.js";

export default class Functions extends ApiCommand<typeof Functions> {
  static description = "Get functions that have occured within a time period";

  static examples = [
    `$ <%= config.bin %> functions -u https://example.com
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

    let data: FuncStatus[];
    try {
      const res = await fetch(
        url + `/logs/functions?limit=-1&startTime=${start}&endTime=${end}`
      );
      data = await res.json();
    } catch {
      this.error(`${chalk.red("[FAIL]")} Cannot connect to ${url}.`);
    }

    this.log(
      `${chalk.greenBright("[Success]")} Showing functions from ${chalk.yellow(
        start
      )} to ${chalk.yellow(end)}:\n`
    );

    if (data.length === 0) {
      this.warn("No function calls in the given timeframe");
    }

    for (const fn of data) {
      const { funcId, funcName, lastUpdate, invoked, status } = fn;
      const emoji = getEmoji(status);
      const time = new Date(lastUpdate).toUTCString();

      this.log(
        `${emoji}${chalk.greenBright(
          funcName
        )} | ${funcId} | ${chalk.yellowBright(invoked)} | ${chalk.yellow(time)}`
      );
    }
  }
}
