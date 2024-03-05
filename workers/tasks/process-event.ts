import { Task } from "graphile-worker";

interface Event {
  name: string;
  payload?: unknown;
}

const isValidEvent = (event: unknown): event is Event => {
  return (
    !!event &&
    typeof event === "object" &&
    "name" in event &&
    typeof event.name === "string"
  );
};

const process_event: Task = async function (event, helpers) {
  if (!isValidEvent(event)) {
    return;
  }

  console.log(event.name);
};

export default process_event;
