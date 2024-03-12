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
}

export class StepComplete extends Error {
  stepId: string;
  stepValue: any;

  constructor(stepId: string, stepValue: any) {
    super(`Not an error: ${stepId} completed`);
    this.stepId = stepId;
    this.stepValue = stepValue;
  }
}
