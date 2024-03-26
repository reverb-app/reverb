import ingress from './ingress';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = ingress;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
