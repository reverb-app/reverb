import { Args, Command } from "@oclif/core";
import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";

export default class Set extends Command {
  static args = {
    apiUrl: Args.string({
      description: "The default API URL to ask for logs from",
      required: true,
    }),
  };

  static description =
    "Sets the default API URL for future <%= config.bin %> calls";

  async run(): Promise<void> {
    const { args } = await this.parse(Set);

    const config = JSON.stringify({ apiUrl: args.apiUrl });
    await fs.mkdir(this.config.configDir, {
      recursive: true,
    });
    await fs.writeFile(path.join(this.config.configDir, "config.json"), config);

    this.log(chalk.green("[Success]"));
  }
}
