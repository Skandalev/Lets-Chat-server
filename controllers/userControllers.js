const asyncHandler = require('express-async-handler')
const generateToken = require('../config/genarateToken')
const User = require('../models/userModel')

const registerUser = asyncHandler(async (req,res)=>{
 const {name,email,password,picture} = req.body
 if(!name || !email || !password ){
    res.status(400)
    throw new Error("please Enter all the fiels")
 }
 const userExist = await User.findOne({email})
 if(userExist){
    res.status(400)
    throw new Error("User already exist")
 } else{
 const user = await User.create({name,email,password,picture})
 if(user){
    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        picture:user.picture,
        token: generateToken(user._id)
    })
 }else{
    throw new Error("Failed to create User try again later")
 }
}})

const authUser = asyncHandler(async(req,res)=>{
   const {email,password} = req.body
   const user = await User.findOne({email})
   if(user && await user.matchPassword(password) ){
      res.status(201).json({
          _id:user._id,
          name:user.name,
          email:user.email,
          picture:user.picture,
          token: generateToken(user._id)
      })
   }else{
      res.status(401)
      throw new Error("Wrong Email or Password")
   }
})

const allUsers = asyncHandler(async(req,res)=>{
   const keyword =req.query.search?{
      $or:[
         {name:{$regex:req.query.search,$options:"i"}},
         {email:{$regex:req.query.search,$options:"i"}},
      ]
   }:{}
   const users = await User.find(keyword).find({_id:{$ne:req.user._id}})
   res.send(users)
})


module.exports ={registerUser,authUser,allUsers}