export class Step {
  #cache: { [key: string]: any };

  constructor(cache: { [key: string]: any }) {
    this.#cache = cache;
  }

  async run(id: string, callback: () => Promise<any>) {
    if (id in this.#cache) {
      return this.#cache[id];
    }
    const result = await callback();
    throw new StepComplete(id, result);
  }

  async delay(id: string, timePeriod: string) {
    if (id in this.#cache) {
      return this.#cache[id];
    }
    timePeriod = timePeriod.toLowerCase();

    const regex = /(?<quantity>\d+)(?<unit>s|m|h|d|w)/g;
    let match = regex.exec(timePeriod);

    if (!match) {
      throw new Error(
        `${timePeriod} not correctly formatted time period string.`
      );
    }

    let totalMs = 0;
    while (match) {
      const time = match.groups as {
        quantity: string;
        unit: 's' | 'm' | 'h' | 'd' | 'w';
      };

      let ms = Number(time.quantity);

      switch (time.unit) {
        case 'w':
          ms *= 7;
        case 'd':
          ms *= 24;
        case 'h':
          ms *= 60;
        case 'm':
          ms *= 60;
        case 's':
          ms *= 1000;
          break;
        default:
          const _unknown: never = time.unit;
          return _unknown;
      }

      totalMs += ms;
      match = regex.exec(timePeriod);
    }

    throw new DelayInitiated(id, totalMs);
  }
}

export class StepComplete extends Error {
  stepId: string;
  stepValue: any;

  constructor(stepId: string, stepValue: any) {
    super(
      `StepComplete ${stepId}: Do not catch errors from step.run inside a created function, this will automatically be handled`
    );
    this.stepId = stepId;
    this.stepValue = stepValue;
  }
}

export class DelayInitiated extends Error {
  stepId: string;
  delayInMs: number;

  constructor(stepId: string, delayInMs: number) {
    super(
      `DelayIntiated ${stepId}: Do not catch errors from step.delay inside a created function, this will automatically be handled`
    );
    this.stepId = stepId;
    this.delayInMs = delayInMs;
  }
}
