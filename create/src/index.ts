import decompress from "decompress";
import chalk from "chalk";
import fs from "fs/promises";

const TEMPLATE_URL =
  "https://github.com/reverb-app/reverb-template/archive/refs/heads/main.zip";

const directoryExists = async () => {
  try {
    await fs.access(`./${process.argv[2]}`);
    return true;
  } catch {
    return false;
  }
};

const downloadTemplate = async () => {
  const res = await fetch(TEMPLATE_URL);

  return Buffer.from(await res.arrayBuffer());
};

const extractTemplate = async (template: Buffer) => {
  const files = await decompress(template, ".");
};

const run = async () => {
  console.info(chalk.yellowBright("Welcome to create-reverb.\n"));

  if (!process.argv[2]) {
    console.info(
      chalk.red("Please specify a directory name via the command line.")
    );
    console.info("An example would be:");
    console.info(chalk.yellow("    npm create reverb myFunctionServer"));
    return;
  }

  if (await directoryExists()) {
    console.info(chalk.red("Directory already exists."));
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
