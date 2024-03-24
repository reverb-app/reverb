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
