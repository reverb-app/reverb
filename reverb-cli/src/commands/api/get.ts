import { Command } from "@oclif/core";
import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";

export default class Get extends Command {
  static description =
    "Gets the default API Config currently set for future <%= config.bin %> calls";

  async run(): Promise<void> {
    try {
      const userConfig = JSON.parse(
        await fs.readFile(path.join(this.config.configDir, "config.json"), {
          encoding: "utf-8",
        })
      );

      this.logJson(userConfig);
    } catch {
      this.error(chalk.red("No API config set"));
    }
  }
}
