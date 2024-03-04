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
  fn: async () => {
    console.log('Hey, Vinnie!');
  },
});

startServer();
