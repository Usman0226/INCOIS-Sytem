const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/user',authenticateToken,userRoutes)
app.use('/auth',authoritiesRoutes)



module.exports = app