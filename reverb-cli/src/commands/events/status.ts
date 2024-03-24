import { Args } from "@oclif/core";
import chalk from "chalk";

import { FuncStatus } from "../../types/types.js";
import { ApiCommand } from "../../apiCommand.js";

export default class Status extends ApiCommand<typeof Status> {
  static args = {
    eventId: Args.string({
      description: "The Event ID to get the status for",
      required: true,
    }),
  };

  static description = "Get the status of everything related to a single event";

  getEmoji(status: "completed" | "error" | "running"): "🔴" | "🟡" | "🟢" {
    switch (status) {
      case "completed": {
        return "🟢";
      }

      case "running": {
        return "🟡";
      }

      case "error": {
        return "🔴";
      }

      default: {
        const val: never = status;
        return val;
      }
    }
  }

  async run(): Promise<void> {
    const { args } = await this.parse(Status);
    const url = this.getUrl();

    let data: {
      functions: FuncStatus[];
    };

    try {
      const res = await fetch(url + "/logs/events/" + args.eventId);

      if (res.status === 500) {
        this.error(
          `${chalk.red("[FAIL]")} Internal Server Error, try again later`
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

    if (data.functions.length === 0) {
      this.warn("No functions invocations found for event");
    }

    for (const fn of data.functions) {
      const { funcId, funcName, invoked, status } = fn;
      const emoji = this.getEmoji(status);
      const time = new Date(invoked).toUTCString();

      this.log(
        `${emoji}${chalk.greenBright(funcName)} | ${funcId} | ${chalk.yellow(
          time
        )}`
      );
    }
  }
}
