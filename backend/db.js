const mongoose = require('mongoose')

const connectDB = async ()=>{
    try {
        await mongoose.connect('mongodb://localhost:27017/INCOIS')
        console.log("DB connected !");
        
    } catch (error) {
        console.log("DB connection failed !")       
    }
}

module.exports = connectDB