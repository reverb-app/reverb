import decompress from "decompress";
import chalk from "chalk";
import fs from "fs/promises";

const importChalk = async () => {
  return await import("chalk");
};

const downloadTemplate = async () => {
  const res = await fetch(
    "https://github.com/2401-Team-6/reverb-template/archive/refs/heads/main.zip"
  );

  return Buffer.from(await res.arrayBuffer());
};

const extractTemplate = async (template: Buffer) => {
  const files = await decompress(template, ".");
};

const run = async () => {
  console.info(chalk.yellowBright("Welcome to create-reverb.\n"));

  if (!process.argv[2]) {
    console.info(chalk.red("Please specify a directory via the command line."));
    console.info("An example would be:");
    console.info(chalk.yellow("    npm create reverb myFunctionServer"));
    return;
  }

  console.info("1/3: Downloading template.");
  const buffer = await downloadTemplate();

  console.info("2/3: Extracting files.");
  await extractTemplate(buffer);

  console.info("3/3: Renaming directory.");
  await fs.rename("./reverb-template-main", `./${process.argv[2]}`);

  console.info(chalk.green("\nDONE!\n"));
  console.info("Next Steps:");
  console.info(`    1. cd ${process.argv[2]}`);
  console.info("    2. npm install");
};

run();
