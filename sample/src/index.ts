import dotenv from "dotenv";
dotenv.config();
import functionsExportType from "@reverb-app/functions";
import(
  process.env.NODE_ENV === "development"
    ? "@reverb-app/functions"
    : "@reverb-app/functions"
).then(
  (
    reverb: typeof functionsExportType | { default: typeof functionsExportType }
  ) => {
    reverb = "default" in reverb ? reverb.default : reverb;

    const func1 = reverb.createFunction({
      id: "first-function",
      event: "event1",
      fn: async () => {
        console.log("Hello world");
      },
    });

    const func2 = reverb.createFunction({
      id: "second-function",
      event: "event1",
      fn: async () => {
        console.log("Hi :)");
      },
    });

    const func3 = reverb.createFunction({
      id: "third-function",
      event: "event2",
      fn: async (event) => {
        if (
          !!event.payload &&
          "url" in event.payload &&
          typeof event.payload.url === "string"
        ) {
          fetch(event.payload.url);
        }
      },
    });

    const func4 = reverb.createFunction({
      id: "step-function",
      event: "event3",
      fn: async (event, step) => {
        await step.run("phone person", async () => console.log("phone person"));
        await step.delay("some delay", "1m30s");
        await step.run("email person", async () => console.log("email person"));
      },
    });

    const func5 = reverb.createFunction({
      id: "function-calls-function",
      event: "event4",
      fn: async (event, step) => {
        await step.invoke("call 3rd function", "third-function", {
          url: "https://example.com/",
        });
      },
    });

    const func6 = reverb.createFunction({
      id: "emit-event-function",
      event: "event5",
      fn: async (event, step) => {
        await step.emitEvent("emit-event2", "event2", {
          url: "https://example.com/",
        });
      },
    });

    const func7 = reverb.createFunction({
      id: "cron-function",
      cron: "*/4 * * * *",
      fn: async (event, step) => {
        await step.invoke("call 3rd function", "third-function", {
          url: "https://example.com/",
        });
      },
    });

    const func8 = reverb.createFunction({
      id: "error-function",
      event: "error",
      fn: async () => {
        throw new Error("This error is for testing purposes");
      },
    });

    const func9 = reverb.createFunction({
      id: "webhook-test",
      event: "reverb-received-webhook",
      fn: async (event) => {
        console.log(event);
      },
    });

    reverb.serve();
  }
);
