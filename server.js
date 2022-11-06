const express = require('express')
const  mongoose  = require("mongoose")
const dotenv = require('dotenv')
const { chats } = require('./data')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
const app = express()
const colors = require('colors')
const { notFound, errorHandler } = require('./midellware/errorMiddelware')
dotenv.config()
app.use(express.json())

mongoose.connect(process.env.DB,{useNewUrlParser:true})
        .then(()=>console.log('conected to DB'.red.bold))
        .catch((err)=>console.log(err))

app.use((req, res, next) => {
        res.header('Access-Control-Allow-Methods','*')
        res.header('Access-Control-Allow-Origin','*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization,token,origin');
        next();
        });



app.use("/api/user",userRoutes)
app.use("/api/chat",chatRoutes)
app.use("/api/message",messageRoutes)

app.use(notFound)
app.use(errorHandler)
const PORT = process.env.PORT || 5000
const server = app.listen(PORT,console.log("server running on "+PORT.yellow.bold))

const io =require('socket.io')(server,{
        pingTimeout:60000,
        cors:{
                origin:"https://lets-talk-skandalev.netlify.app",
                methods: ["GET", "POST","PUT"],
                credentials: true
        }
})

io.on("connection",(socket)=>{
 socket.on('setup',(userData)=>{
   socket.join(userData._id)
   socket.emit("connected")
 })

 socket.on('join room',(roomId)=>{
        socket.join(roomId)
        console.log("user joined room "+roomId);
      })
 socket.on('typing',(room)=>{
     socket.in(room).emit("typing")
 })     
 socket.on('stop typing',(room)=>{
     socket.in(room).emit("stop typing")
 })     
 socket.on('new message',(newMessageRecieved)=>{
        let chat = newMessageRecieved.chat
        if(!chat.users){
                console.log("no chat users");
        }
        chat.users.forEach(user => {
               if(user._id==newMessageRecieved.sender._id){
                return
               } 
          socket.in(user._id).emit("message recieved",newMessageRecieved)     
        });
 })    
 socket.off("setup",()=>{
        console.log("user dissconected");
        socket.leave(userData._id)
 }) 
})