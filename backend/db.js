const mongoose = require('mongoose')

const connectDB = async ()=>{
    try {
        await mongoose.connect('mongodb+srv://chandanusmangani_db_user:bWzcOUeQOhZ5YZbm@cluster1.vwunolx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1')
        console.log("DB connected !");
        
    } catch (error) {
        console.log("DB connection failed !",error)       
    }
}

module.exports = connectDB