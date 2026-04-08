import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 4001;

app.listen(port, () => {
  console.log(`Inventory API running on port ${port}`);
});
