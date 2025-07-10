import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.get("/", (_req, res) => {
  res.send("Hello, it's WS server");
});

io.on("connection", (_socket) => {
  console.log("a user connected");
});

const PORT = 3009;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
