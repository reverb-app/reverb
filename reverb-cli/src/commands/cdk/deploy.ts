import fs from "fs/promises";
import ora from "ora";
import path from "path";
import chalk from "chalk";
import { DIRECTORY_NAME, runCommand } from "../../utils/utils.js";
import { CdkCommand } from "../../cdk-command.js";

export default class Deploy extends CdkCommand<typeof Deploy> {
  static description =
    "This will deploy the default Reverb infrastructure to AWS using the CDK.\n Before running this command, please link your AWS account to the AWS CLI and bootstrap your CDK.";

  async run(): Promise<void> {
    this.log("Preparing to deploy Reverb");

    const buffer = await this.download();
    await this.unzip(buffer);
    await this.dependencies();
    await this.deploy();

    const settings = await this.parseOutput();
    await this.setConfig(settings);

    this.log(`\n${chalk.green("[DONE]")}\n`);
    this.log(`API Gateway URL: ${chalk.green(settings.apiUrl)}`);
    this.log(`API key: ${chalk.green(settings.apiKey)}`);
    this.log(`Update Lambda: ${chalk.green(settings.lambdaName)}\n`);
    this.log(
      `You can always retrieve this information by using ${chalk.yellow(
        "reverb-cli api:get"
      )}\n`
    );
    this.log(
      `To deploy your own function server to the reverb infrastructure run:\n    ${chalk.yellow(
        "npm create reverb [appName]"
      )}\nThen follow the README's inststructions`
    );
  }

  private async deploy() {
    const deploySpinner = ora({
      color: "yellow",
      text: "Deploying infrastructure to AWS [This may take tens of minutes]",
    }).start();

    await runCommand(
      `cd ${path.join(
        this.config.configDir,
        DIRECTORY_NAME
      )} && cdk deploy -m direct -O ${path.join(
        this.config.configDir,
        "cdk-out.json"
      )} --require-approval never reverb-stack`
    );

    deploySpinner.stopAndPersist({
      symbol: "✅",
      text: "Infrastructure Deployed",
    });

    return;
  }

  private async setConfig(settings: object) {
    const configSpinner = ora({
      color: "yellow",
      text: "Saving cdk settings to config",
    }).start();

    try {
      const jsonConfig = JSON.stringify(settings);
      await fs.writeFile(
        path.join(this.config.configDir, "config.json"),
        jsonConfig
      );
    } catch {
      this.error(chalk.red("Something went terribly wrong writing config"));
    }

    configSpinner.stopAndPersist({
      symbol: "✅",
      text: "Configuration Saved",
    });
  }

  private async parseOutput() {
    const outs = JSON.parse(
      await fs.readFile(path.join(this.config.configDir, "cdk-out.json"), {
        encoding: "utf-8",
      })
    );
    const settings: { [key: string]: string } = {};

    const stack = outs["reverb-stack"];

    for (const key in stack) {
      if (key.startsWith("reverbapigatewayEndpoint")) {
        settings.apiUrl = stack[key];
      }

      if (key.startsWith("reverbapigatewayapiKey")) {
        settings.apiKey = stack[key];
      }

      if (key.startsWith("updatelambdaname")) {
        settings.lambdaName = stack[key];
      }
    }

    return settings;
  }
}
