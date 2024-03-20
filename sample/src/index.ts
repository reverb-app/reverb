import dotenv from "dotenv";
dotenv.config();
import functionsExportType from "@reverb-app/functions";
import(
  process.env.NODE_ENV === "development"
    ? "../../functions/src"
    : "@reverb-app/functions"
).then(
  (
    server: typeof functionsExportType | { default: typeof functionsExportType }
  ) => {
    server = "default" in server ? server.default : server;

    const func1 = server.createFunction({
      id: "first-function",
      event: "event1",
      fn: async () => {
        console.log("Hello world");
      },
    });

    const func2 = server.createFunction({
      id: "second-function",
      event: "event1",
      fn: async () => {
        console.log("Hi :)");
      },
    });

    const func3 = server.createFunction({
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

    const func4 = server.createFunction({
      id: "step-function",
      event: "event3",
      fn: async (event, step) => {
        await step.run("phone person", async () => console.log("phone person"));
        await step.delay("some delay", "1m30s");
        await step.run("email person", async () => console.log("email person"));
      },
    });

    const func5 = server.createFunction({
      id: "function-calls-function",
      event: "event4",
      fn: async (event, step) => {
        await step.invoke("call 3rd function", "third-function", {
          url: "https://enaeajsfdm4b.x.pipedream.net/",
        });
      },
    });

    const func6 = server.createFunction({
      id: "emit-event-function",
      event: "event5",
      fn: async (event, step) => {
        await step.emitEvent("emit-event2", "event2", {
          url: "https://enaeajsfdm4b.x.pipedream.net/",
        });
      },
    });

    const func7 = server.createFunction({
      id: "cron-function",
      cron: "*/4 * * * *",
      fn: async (event, step) => {
        await step.invoke("call 3rd function", "third-function", {
          url: "https://enaeajsfdm4b.x.pipedream.net/",
        });
      },
    });

    server.serve();
  }
);
