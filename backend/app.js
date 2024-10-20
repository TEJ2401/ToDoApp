const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const todoRoutes = require("./routes/todoRoutes");
const routes = require("./routes/getRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
const { Server } = require("socket.io");
const http = require("http");
// Middleware

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes

const server = http.createServer(app);
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("New client connected");
  console.log(socket.id);
  io.emit("connection", {
    message: "A new client has connected",
    socketId: socket.id,
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
app.use("/api/todos", todoRoutes(io));
app.use("/api/users", userRoutes);
app.use("/api", routes);
// Start server
// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
