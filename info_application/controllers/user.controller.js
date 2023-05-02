const user= require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const redisClient = require("../helpers/redis")

const signup= async(req,res)= >{
    try{
        const {name,email,password,preffered_city}=
        req.body

        const isUserPresent= await user.findOne({email})
        if(isUserPresent) return res.send("User already Present,login");

        const hash= await bcrypt.hash(password,8)

        const newUser= new user({name,email,password:hash,preffered_city})

        await newUser.save()

        res.send("signup successfullly")
    }
    catch(err){
        res.send(err.message)
    }
}

const login= async(req,res)=>{
    try{
        const{email,password} =req.body

        const isUserPresent= await user.findOne({email})

        if(!isUserPresent) return res.send("user not present, register")

        const isPasswordCorrect = await bcrypt.compare(password,isUserPresent.password)

        if(!isPasswordCorrect) return res.send("invalid credentials")

        const token= await jwt.sign({userId: isUserPresent._id,preffered_city:isUserPresent.preffered_city},process.env.JWT_SECRET,{expiresIn:"6hr"})

        res.send({message:"login success",token})


    }

    catch(err){
        res.send(err.message)
    }
}

const logout= async(req,res)=>{
    try{
        const token= req.headers?.authrization?.split("")[1]

        if(!token) return res.status(402)

        await redisClient.set(token,token)
        res.send("logout success")


    }
    catch(err){
        res.send(err.message)
    }
}
module.exports= {login,logout,signup}