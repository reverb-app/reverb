import ingress from './ingress';

const app = ingress;

const func1 = app.createFunction({
  id: 'first-function',
  event: 'event1',
  fn: async () => {
    console.log('Hello world');
  },
});
const func2 = app.createFunction({
  id: 'second-function',
  event: 'event1',
  fn: async () => {
    console.log('Hi :)');
  },
});
const func3 = app.createFunction({
  id: 'third-function',
  event: 'event2',
  fn: async () => {
    console.log('Hey, Vinnie!');
  },
});

app.listen(3000);
