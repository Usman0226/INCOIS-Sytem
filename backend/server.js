const app = require('./src/app');
const connectDB = require('./db')

const port = process.env.PORT || 3000;


try{
    connectDB()
}catch(error){
    console.log("Error at DB connection !",error)
}

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});