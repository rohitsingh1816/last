const mongoose = require("mongoose")

const userSchema= mongoose.schema({
    name:{type:String, required:true},
    email : {type: String, required:true, unique:true},
    password:{type:String, required:true},
    preferred_city : {type:String, required:true}
})

const user= mongoose.model("user",userSchema)

module.exports= user