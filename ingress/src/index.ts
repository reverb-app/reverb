import ingress from "./ingress";
import dotenv from "dotenv";
dotenv.config();

const app = ingress;

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
