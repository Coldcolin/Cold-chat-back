const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7777;
const URL = process.env.MONGO_URL

app.use(cors());
app.use(express.json());

mongoose.set('strictQuery', false);
mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log(`connection successful`)
}).catch((err)=>{
    console.log(err.message)
})

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})

const io = socket(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  // global.onlineUsers = new Map();
  global.messages = new Map();

  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      messages.set(userId, socket.id);
      // console.log(messages)
    });
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = messages.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        // console.log(sendUserSocket)
      }
    });

    socket.on("new-user", (data)=>{
      onlineUsers.set("newUser", data)
    })

    socket.on("get-users", (data)=>{
      const allUsers = onlineUsers.get("newUser");
      if(allUsers){
        socket.to(allUsers).emit("users-recieve", data)
      }
      // io.emit("users", ()=>{
        
      // })
    })
    
  });