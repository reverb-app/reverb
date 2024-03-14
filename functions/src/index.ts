import serve from "./server";
import functions from "./services/fn";

export default { serve, createFunction: functions.createFunction }