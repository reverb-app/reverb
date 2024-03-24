import { Command } from "@oclif/core";
import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";

export default class Set extends Command {
  static description =
    "Gets the default API URL currently set for future <%= config.bin %> calls";

  async run(): Promise<void> {
    try {
      const userConfig = JSON.parse(
        await fs.readFile(path.join(this.config.configDir, "config.json"), {
          encoding: "utf-8",
        })
      );

      if ("apiUrl" in userConfig && typeof userConfig.apiUrl === "string") {
        this.log(`API URL is ${chalk.greenBright(userConfig.apiUrl)}`);
        return;
      }
    } catch (e) {}
    this.error(chalk.red("No API URL set"));
  }
}
