import app from "./app.js";
import "./database.js";
import { config } from "./config.js";

async function main() {
  try {
    app.listen(config.server.PORT, () => {
      console.log("Server running on port " + config.server.PORT);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

main();