const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());

app.use(cors({
    origin:"*"
}))

const mongoString = process.env.DATABASE_URL
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

app.get('/', function (req, res) {
    res.send("This  Home Page....!!!")
});

const user_controller = require('./controller/UserController')
app.use('/user', user_controller)

const admin_controller = require('./controller/AdminController')
app.use('/admin', admin_controller)

app.listen(5000, () => {
    console.log(`Server Started at ${5000}`)
})