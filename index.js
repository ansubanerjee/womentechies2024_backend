
//IMPORTS
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');




//SCHEMA
const Women = require('./models/women');
const User_category = require('./models/user_category');
const User = require('./models/user');

//GENERAL
require('dotenv/config');
app.use(cors());
const api = process.env.API_URL;

//MIDDLEWARE

//ROUTERS



const db_url = process.env.db_url;
const connectionParams = {
    useNewUrlParser : true,
    useUnifiedTopology : true
}

mongoose.connect(db_url, connectionParams).then(()=>{
    console.log("Connected to the DB")
}).catch((e)=>{
    console.log("Error: ", e)
});

app.listen(3000, ()=>{
    console.log(api);
    console.log("Running at http://localhost:3000");
})