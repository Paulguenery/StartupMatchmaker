import { Server as HttpServer } from "http";
import { Server } from "socket.io";

export function setupWebSocket(httpServer: HttpServer) {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("join-room", (data) => {
      const room = `project-${data.projectId}`;
      socket.join(room);
      socket.broadcast.to(room).emit("user-connected", { userId: data.userId });
    });

    socket.on("offer", (data) => {
      socket.broadcast.emit("offer", {
        offer: data.offer,
        from: socket.id,
      });
    });

    socket.on("answer", (data) => {
      socket.broadcast.emit("answer", {
        answer: data.answer,
        from: socket.id,
      });
    });

    socket.on("ice-candidate", (data) => {
      socket.broadcast.emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
}
