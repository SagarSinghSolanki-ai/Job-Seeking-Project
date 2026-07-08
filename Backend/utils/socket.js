import { Server } from "socket.io";

let io;
const userSockets = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      if (userId) {
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        socket.userId = userId;
        console.log(`Socket ${socket.id} registered to User ${userId}`);
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
        }
        console.log(`Socket ${socket.id} disconnected`);
      }
    });
  });

  return io;
};

export const emitSocketEvent = (userId, eventName, data) => {
  if (io && userSockets.has(userId)) {
    const socketIds = userSockets.get(userId);
    socketIds.forEach((socketId) => {
      io.to(socketId).emit(eventName, data);
    });
    console.log(`Socket event '${eventName}' sent to User ${userId}`);
  }
};
