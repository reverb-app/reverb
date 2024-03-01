import ingress from './ingress';

const app = ingress;

const func1 = app.createFunction({
  id: 'first-function',
  event: 'first-event',
  fn: () => {
    console.log('Hello world');
  },
});
const func2 = app.createFunction({
  id: 'first-function',
  event: 'first-event',
  fn: () => {
    console.log('Hi :)');
  },
});

app.listen(3000);
