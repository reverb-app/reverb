import { Args } from "@oclif/core";
import chalk from "chalk";

import { FuncStatus } from "../../types/types.js";
import { ApiCommand } from "../../apiCommand.js";
import { getEmoji } from "../../utils/utils.js";

export default class Status extends ApiCommand<typeof Status> {
  static args = {
    eventId: Args.string({
      description: "The Event ID to get the status for",
      required: true,
    }),
  };

  static description = "Get the status of everything related to a single event";

  async run(): Promise<void> {
    const { args } = await this.parse(Status);
    const url = await this.getUrl();

    let data: { logs: { function: FuncStatus }[] };

    try {
      const res = await fetch(url + "/logs/events/" + args.eventId);

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
      this.error(`${chalk.red("[FAIL]")} Cannot connect to ${url}`);
    }

    this.log(
      `${chalk.greenBright("[Success]")} Event ID ${
        args.eventId
      } function statuses:\n`
    );

    if (data.logs.length === 0) {
      this.warn("No functions invocations found for event");
    }

    for (const { function: fn } of data.logs) {
      const { funcId, funcName, invoked, status } = fn;
      const emoji = getEmoji(status);
      const time = new Date(invoked).toUTCString();

      this.log(
        `${emoji}${chalk.greenBright(funcName)} | ${funcId} | ${chalk.yellow(
          time
        )}`
      );
    }
  }
}
