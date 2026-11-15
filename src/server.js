import "dotenv/config";

import app from "./app.js";

import connectDB from "./config/db.js";

import {
  connectMcpClient,
  closeMcpClient
} from "./services/mcpClientService.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {

  try {

    await connectDB();

    await connectMcpClient();

    const server = app.listen(PORT, () => {

      console.log(`Server running on port ${PORT}`);

    });

    const shutdown = async () => {

      server.close();

      await closeMcpClient();

      process.exit(0);

    };

    process.on("SIGINT", shutdown);

    process.on("SIGTERM", shutdown);

  } catch (error) {

    console.error("Server startup failed:", error);

    process.exit(1);

  }

};

startServer();