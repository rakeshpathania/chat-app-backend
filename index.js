import express from "express";
// import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/config.js";
import cors from "./config/cors.js";
import { Server } from "socket.io";

const app = express();
dotenv.config();

app.use(cors);
// app.use(cors());
app.use(express.json());
connectDB();


const getChatRoom = (first_id, second_id) => {
  return `ChatRoom${first_id}_${second_id}`;
}
//user routes... 
import { UserRoutes } from "./routes/userRoutes.js"
app.use('/user', UserRoutes);

//message routes... 
import { MessageRoute } from "./routes/messageRoute.js"
app.use('/messages', MessageRoute);


const server = app.listen(process.env.PORT, () => {
  console.log("Server Started on Port " + process.env.PORT);
})

const io = new Server(server, {
  cors: {
    origin: "*",
    // credentials: true,
  },
});



io.on("connection", (socket) => {

  socket.on('connectChatRoom', (id, receiver_id) => {
    if (id) {
      socket.join(getChatRoom(id, receiver_id));
    }

  });

  socket.on("send-msg", (data) => {

    let first_id = data.to < data.from ? data.to : data.from;
    let second_id = data.to > data.from ? data.to : data.from;
    io.sockets.to(getChatRoom(first_id, second_id)).emit("msg-recieve", data.msg);


  });
})