const asyncHandler = require('express-async-handler')
const Chat =require('../models/chatmodel');
const User = require('../models/userModel');

const accessChat = asyncHandler(async(req,res)=>{
    const {userId} =req.body
    if(!userId){
        console.log("user id param not sent");
       return res.sendStatus(400)
    }
    let isChat = await Chat.find({
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}},
        ]
    }).populate("users","-password")
    .populate("latestMessage","-password")

    isChat=await User.populate(isChat,{path:"latestMessage.sender",select:"name pic email"})
   if(isChat.length>0){
    res.send(isChat[0])
   }else{
    let chatData ={
        chatName:"sender",
        isGroupChat:false,
        users:[req.user._id,userId]
    }
    try {
        const createdChat = await Chat.create(chatData)
        const fullChat = await Chat.findOne({_id:createdChat._id}).populate("users","-password")
          res.status(200).send(fullChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
   }
})

const fetchChats = asyncHandler(async(req,res)=>{

    try {
        Chat.find({users:{$elemMatch:{$eq:req.user._id }}})
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async(result)=>{
            result= await User.populate(result,{
                path:"latestMesssage.sender",
                select:"name pic email"})
                res.status(200).send(result)
        }) 
       
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
        
    }
    
})
const createGroupChat = asyncHandler(async(req,res)=>{
if(!req.body.users||!req.body.name){
return res.status(400).send({message:"please fill everything"})
}
let users = JSON.parse(req.body.users)
if(users.length<2){
    res.status(400)
    res.send("More then 2 users required in group chat")
}
users.push(req.user)
try {
    const groupChat = await Chat.create({
        chatName:req.body.name,
        users:users,
        isGroupChat:true,
        groupAdmin:req.user
    })
    const fullGroupChat = await Chat.findOne({_id:groupChat._id})
    .populate("users","-password")
    .populate("groupAdmin","-password")
    res.status(200).json(fullGroupChat)
} catch (error) {
    res.status(400)
    throw new Error(error.message)
}
})

const renameGroup = asyncHandler(async(req,res)=>{
 const {chatId,chatName} = req.body
   const updatedChat = await Chat.findByIdAndUpdate(chatId,{
    chatName
   },{new:true}).populate("users","-password")
   .populate("groupAdmin","-password")
   if(!updatedChat){
    res.status(404)
    throw new Error("Chat not found")
   }else{
    res.json(updatedChat)
   }
})
const addToGroup = asyncHandler(async(req,res)=>{

})
module.exports = {accessChat, fetchChats,createGroupChat,renameGroup,addToGroup}