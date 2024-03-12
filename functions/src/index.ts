import startServer from './server';
import functions from './services/fn';

const func1 = functions.createFunction({
  id: 'first-function',
  event: 'event1',
  fn: async () => {
    console.log('Hello world');
  },
});
const func2 = functions.createFunction({
  id: 'second-function',
  event: 'event1',
  fn: async () => {
    console.log('Hi :)');
  },
});

const func3 = functions.createFunction({
  id: 'third-function',
  event: 'event2',
  fn: async (event) => {
    if (
      !!event.payload &&
      'url' in event.payload &&
      typeof event.payload.url === 'string'
    ) {
      fetch(event.payload.url);
    }
  },
});

const func4 = functions.createFunction({
  id: 'step-function',
  event: 'event3',
  fn: async (event, step) => {
    await step.run('phone person', async () => console.log('phone person'));
    await step.run('email person', async () => console.log('email person'));
  },
});

startServer();
