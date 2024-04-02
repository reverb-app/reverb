import { Command } from "@oclif/core";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import decompress from "decompress";
import ora from "ora";
import path from "path";
import chalk from "chalk";

const GITHUB_ZIP =
  "https://github.com/2401-Team-6/reverb-infrastructure/archive/refs/heads/master.zip";
const DIRECTORY_NAME = "reverb-infrastructure-master";
const runCommand = promisify(exec);

export default class Deploy extends Command {
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

  private async download() {
    const downloadSpinner = ora({
      color: "yellow",
      text: "Downloading CDK Template",
    }).start();

    let buffer: Buffer | null = null;

    if (!(await this.cdkExists())) {
      const res = await fetch(GITHUB_ZIP);
      buffer = Buffer.from(await res.arrayBuffer());
    }
    downloadSpinner.stopAndPersist({
      symbol: "✅",
      text: "Downloaded CDK Template",
    });

    return buffer;
  }

  private async unzip(buffer: Buffer | null) {
    const unzipSpinner = ora({
      color: "yellow",
      text: "Unzipping Template",
    }).start();

    if (buffer) {
      const files = await decompress(buffer, this.config.configDir);
    }

    unzipSpinner.stopAndPersist({
      symbol: "✅",
      text: "CDK Template Unzipped",
    });
  }

  private async dependencies() {
    const dependenciesSpinner = ora({
      color: "yellow",
      text: "Installing Dependencies",
    }).start();

    if (!(await this.modulesExists())) {
      await runCommand(
        `cd ${path.join(this.config.configDir, DIRECTORY_NAME)} && npm install`
      );
    }

    dependenciesSpinner.stopAndPersist({
      symbol: "✅",
      text: "Dependencies Installed",
    });
  }

  private async deploy() {
    const deploySpinner = ora({
      color: "yellow",
      text: "Deploying infrastructure to AWS [This may take tens of minutes]",
    }).start();

    await fs.mkdir(this.config.configDir, {
      recursive: true,
    }); // just in case it does not exist

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

  private async cdkExists() {
    try {
      await fs.access(path.join(this.config.configDir, DIRECTORY_NAME));
      return true;
    } catch {
      return false;
    }
  }

  private async modulesExists() {
    try {
      await fs.access(
        path.join(this.config.configDir, DIRECTORY_NAME, "node_modules")
      );
      return true;
    } catch {
      return false;
    }
  }
}
