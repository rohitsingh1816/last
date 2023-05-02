const redisClient = require ("../helpers/redis")
const axios= require("axios")

const userCitiesList = require("../models/city.model")
const API_KEY= process.env.IP_API_KEY

const getCityData = async (req,res) =. {
    try{
        const city= req.params.city || req.body.preffered_city

        const isCityInCatch= await redisClient.get(`${city}`)

        console.log(isCityInCatch)

        if(isCityInCatch) return res.status(201).send({data:isCityInCatch})

        const response= await axios.get(`https://ipapi.co/${ip}&q=${city}`)

        const ipdata = response.data

        console.log(ipdata)

        redisClient.set(city,JSON.stringify(ipdata),{EX:6 * 60 *60})

        await userCitiesList.findOneAndUpdate({userId: req.body.userId},
        {
            userId: req.body.userId,$push: {previousSearches:city}
        },
        {new:true,upsert:true,setDefaultsOnInsert:true})

        return res.send({data :ipdata})

    }
    catch (err) {
        return res.send(501).send(err.message)

    }
}

const mostSearchedCity= async (req,res) =>{
    try{
        const cities= await userCitiesList.aggregate([
            $match : {
               userId : req.body.userId 
            }
        },

        {
            $unwind : "$previousSearches"

        },
        {
            $group :{
                _id: "$previousSearches",
                count:{$sum:1}
            }
        },
        {
            $sort : {count:-1}
        }
        ])
    

        const city= cities[0]["_id"]

        const isCityInCatch = await redisClient.get(`${city}`)

        if(isCityInCatch) return res.status(201).send({ data:isCityInCatch})

        const response= await axios.get(`https://ipapi.co/${ip}&q=${city}`)

        const ipdata = response.data

        redisClient.set(city,JSON.stringify(ipdata),{EX:6 * 60 *60})

        await userCitiesList.findOneAndUpdate({userId: req.body.userId},
        {
            userId: req.body.userId,$push: {previousSearches:city}
        },
        {new:true,upsert:true,setDefaultsOnInsert:true})

        return res.send({data :ipdata})

    }
    catch (err) {
        return res.send(501).send(err.message)

    }
}

module.exports= {getCityData,mostSearchedCity}

