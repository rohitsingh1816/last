const= winston = require ("winston")

const{mongoB}= require("winston-mongodb")
 const logger= winston.createLogger({
    level:"info",
    format:winston.format.json()
    transports:[
        new MongoDB({
            db:process.env.MONGO_URL,
            collection :"logs",
            options: {
                useUnifiedTopology:true
            }
        })
    ]
 })
 module.exports= logger