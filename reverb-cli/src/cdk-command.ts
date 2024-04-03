// src/baseCommand.ts
import { Command } from "@oclif/core";
import fs from "fs/promises";
import { DIRECTORY_NAME, GITHUB_ZIP, runCommand } from "./utils/utils.js";
import path from "path";
import ora from "ora";
import decompress from "decompress";

export abstract class CdkCommand<T extends typeof Command> extends Command {
  public async init(): Promise<void> {
    await super.init();
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof CdkCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });
  }

  protected async download() {
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

  protected async unzip(buffer: Buffer | null) {
    const unzipSpinner = ora({
      color: "yellow",
      text: "Unzipping Template",
    }).start();

    await fs.mkdir(this.config.configDir, {
      recursive: true,
    }); // just in case it does not exist

    if (buffer) {
      const files = await decompress(buffer, this.config.configDir);
    }

    unzipSpinner.stopAndPersist({
      symbol: "✅",
      text: "CDK Template Unzipped",
    });
  }

  protected async dependencies() {
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

  protected async cdkExists() {
    try {
      await fs.access(path.join(this.config.configDir, DIRECTORY_NAME));
      return true;
    } catch {
      return false;
    }
  }

  protected async modulesExists() {
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
