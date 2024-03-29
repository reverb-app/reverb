import { Command, Flags, Interfaces } from "@oclif/core";
import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof ApiCommand)["apiFlags"] & T["flags"]
>;

const MILLISECONDS_IN_SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export abstract class ApiCommand<T extends typeof Command> extends Command {
  // define flags that can be inherited by any command that extends BaseCommand
  static apiFlags = {
    apiUrl: Flags.string({
      char: "u",
      description: "The url to the api gateway for this call",
      required: false,
    }),
    apiKey: Flags.string({
      char: "k",
      description: "API key that goes with the api url.",
      required: false,
    }),
    start: Flags.string({
      char: "s",
      description:
        "Start Time for logs to get in a javascript parsable format(Defaults to 7 day prior to end)",
      required: false,
    }),
    end: Flags.string({
      char: "e",
      description:
        "End Time for logs to get in a javascript parsable format(Defaults to now)",
      required: false,
    }),
  };

  protected flags!: Flags<T>;
  protected apiConfig: { apiUrl?: string; apiKey?: string } = {};

  public getUrl(): string {
    if (this.flags.apiUrl) return this.flags.apiUrl;

    if (
      "apiUrl" in this.apiConfig &&
      typeof this.apiConfig.apiUrl === "string"
    ) {
      return this.apiConfig.apiUrl;
    }

    this.error(
      `${chalk.red(
        "[FAIL]"
      )} The -u flag is required if you have not set an api url in config`
    );
  }

  public getKey(): string {
    if (this.flags.apiKey) return this.flags.apiKey;

    if (
      "apiKey" in this.apiConfig &&
      typeof this.apiConfig.apiKey === "string"
    ) {
      return this.apiConfig.apiKey;
    }

    return "";
  }

  public getEndTime(): string {
    if (
      this.flags.end &&
      typeof this.flags.end === "string" &&
      Date.parse(this.flags.end)
    ) {
      return this.flags.end;
    }

    return new Date().toISOString();
  }

  public getStartTime(): string {
    if (
      this.flags.start &&
      typeof this.flags.start === "string" &&
      Date.parse(this.flags.start)
    ) {
      return this.flags.start;
    }

    const time = new Date(this.getEndTime());
    return new Date(time.getTime() - MILLISECONDS_IN_SEVEN_DAYS).toISOString();
  }

  public async init(): Promise<void> {
    await super.init();
    const { flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof ApiCommand).apiFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });
    this.flags = flags as Flags<T>;

    try {
      this.apiConfig = JSON.parse(
        await fs.readFile(path.join(this.config.configDir, "config.json"), {
          encoding: "utf-8",
        })
      );
    } catch {}
  }
}
