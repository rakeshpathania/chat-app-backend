import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import { connectDB } from "./config/config.js";
import cors from "./config/cors.js";
import { UserRoutes } from "./routes/userRoutes.js";
import { MessageRoute } from "./routes/messageRoute.js";
import { errorHandler } from "./middleware/errorHandler.js"; // Create this middleware
import { logger } from "./traits/logger.js"; // Create this utility

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Constants
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to Database
(async () => {
  try {
    await connectDB();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
})();

// Routes
app.use("/user", UserRoutes);
app.use("/messages", MessageRoute);

// Error handling middleware
app.use(errorHandler);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket.io utility functions
class ChatService {
  static getChatRoom(first_id, second_id) {
    return `ChatRoom_${Math.min(first_id, second_id)}_${Math.max(
      first_id,
      second_id
    )}`;
  }

  static async handleMessage(socket, data) {
    try {
      const { from, to, msg } = data;
      if (!from || !to || !msg) {
        throw new Error('Invalid message data');
      }

      const roomName = this.getChatRoom(from, to);
      logger.info(`Sending message to room: ${roomName}`);

      io.to(roomName).emit("msg-recieve", msg);
    } catch (error) {
      logger.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }
}

// Socket connection handling
const handleSocket = (socket) => {
  logger.info(`New socket connection: ${socket.id}`);

  // Join chat room
  socket.on("connectChatRoom", (id, receiver_id) => {
    try {
      if (!id || !receiver_id) {
        throw new Error('Invalid room parameters');
      }

      const roomName = ChatService.getChatRoom(id, receiver_id);
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined room: ${roomName}`);
    } catch (error) {
      logger.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle messages
  socket.on("send-msg", (data) => ChatService.handleMessage(socket, data));

  // Handle disconnection
  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    logger.error(`Socket error: ${socket.id}`, error);
  });
};

// Attach socket handler
io.on("connection", handleSocket);

httpServer.listen(PORT, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});


