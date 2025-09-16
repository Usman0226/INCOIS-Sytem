const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

//Routes  
const authRoutes = require('./Routes/auth.route');

const userRoutes = require('./Routes/user.route');
const authoritiesRoutes = require('./Routes/authorities.route')
const { authenticateToken } = require('./middleware/auth');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically to appear on render
app.use('/uploads', express.static('../uploads'));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/user',authenticateToken,userRoutes)
app.use('/user',userRoutes)
app.use('/auth',authoritiesRoutes)



const uploadsDir = path.join(__dirname, '../uploads');

app.get('/api/uploads', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    console.log("at the uploads directory : ")
    if (err) {
      return res.status(500).json({ error: 'Unable to read uploads folder in the directory !' });
    }
    console.log("Files are uploaded and cross checked with the backend !")
    res.json({ files });
  });
});




module.exports = app