import { exec } from "child_process";
import { promisify } from "util";

export const GITHUB_ZIP =
  "https://github.com/2401-Team-6/reverb-infrastructure/archive/refs/heads/master.zip";
export const DIRECTORY_NAME = "reverb-infrastructure-master";
export const runCommand = promisify(exec);

export const getEmoji = (
  status: "completed" | "error" | "running"
): "🔴" | "🟡" | "🟢" => {
  switch (status) {
    case "completed": {
      return "🟢";
    }

    case "running": {
      return "🟡";
    }

    case "error": {
      return "🔴";
    }

    default: {
      const val: never = status;
      return val;
    }
  }
};
