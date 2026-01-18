const rooms={};

const express=require("express");
const http=require("http");
const { Server }=require("socket.io");
const cors=require("cors");

const app=express();
app.use(cors());

const server=http.createServer(app);
const io=new Server(server, {
  cors:{
    origin:"https://real-time-whiteboard-web.vercel.app/",
    methods:["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);
  socket.on("joinRoom", ({ roomId, password, username, isCreating }) => {
    if(isCreating){
      if(rooms[roomId]){
        socket.emit("errorMsg", "Room already exists");
        return;
      }
      rooms[roomId]={
        password,
        users: [],
        history: []
      };
    }
    if(!rooms[roomId]){
      socket.emit("errorMsg", "Room not found");
      return;
    }
    if(!isCreating && rooms[roomId].password !== password){
      socket.emit("errorMsg", "Incorrect password");
      return;
    }

    socket.join(roomId);

    rooms[roomId].users.push({
      id: socket.id,
      username,
      color: generateRandomColor()
    });

    console.log(`${username} joined room ${roomId}`);

    socket.emit("joinedSuccessfully");
    socket.emit("history", rooms[roomId].history);
    io.to(roomId).emit("userUpdate", rooms[roomId].users);
  });

  socket.on("drawing", ({ roomId, path }) => {
    if(!rooms[roomId]) return;

    rooms[roomId].history.push(path);
    socket.to(roomId).emit("drawing", path);
  });

  socket.on("undo", (roomId) => {
    if(!rooms[roomId]) return;

    rooms[roomId].history.pop();
    io.to(roomId).emit("history", rooms[roomId].history);
  });

  socket.on("mouseMove", ({ roomId, username, x, y }) => {
    socket.to(roomId).emit("mouseUpdate", {
      id: socket.id,
      username,
      x,
      y
    });
  });

  socket.on("disconnecting", () => {
    for(const roomId of socket.rooms){
      if(roomId===socket.id) continue;

      if(rooms[roomId]){
        rooms[roomId].users=rooms[roomId].users.filter(
          (u) => u.id !== socket.id
        );

        io.to(roomId).emit("userUpdate", rooms[roomId].users);

        if(rooms[roomId].users.length===0){
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted`);
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

function generateRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
}

const PORT=5000;
server.listen(PORT, () => {
  console.log(`✅ Whiteboard server running on port ${PORT}`);
});
