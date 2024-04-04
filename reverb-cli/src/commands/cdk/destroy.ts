import ora from "ora";
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import { DIRECTORY_NAME, runCommand } from "../../utils/utils.js";
import { CdkCommand } from "../../cdk-command.js";

export default class Destroy extends CdkCommand<typeof Destroy> {
  static description =
    "This will remove Reverb Infrastructure from your amazon account.";

  async run(): Promise<void> {
    this.log("Preparing to destroy Reverb deployment\n");

    const buffer = await this.download();
    await this.unzip(buffer);
    await this.dependencies();
    await this.destroy();
    await this.delete();

    this.log(`\n${chalk.green("[SUCCESS]")}`);
  }

  private async destroy() {
    const destroySpinner = ora({
      color: "yellow",
      text: "Removing Infrastructure from AWS [This may take tens of minutes]",
    }).start();

    await runCommand(
      `cd ${path.join(this.config.configDir, DIRECTORY_NAME)} && cdk destroy -f`
    );

    destroySpinner.stopAndPersist({
      symbol: "✅",
      text: "Infrastructure Removed",
    });
  }

  private async delete() {
    const deleteSpinner = ora({
      color: "yellow",
      text: "Deleting local CDK files",
    }).start();

    await fs.rm(path.join(this.config.configDir, DIRECTORY_NAME), {
      recursive: true,
      force: true,
    });

    await fs.rm(path.join(this.config.configDir, "cdk-out.json"), {
      force: true,
    });

    deleteSpinner.stopAndPersist({
      symbol: "✅",
      text: "Local CDK Files Deleted",
    });
  }
}
