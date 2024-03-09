const mongoose = require('mongoose');


const Women = require('./models/women');
const User_category = require('./models/user_category');
const User = require('./models/user');

const cors = require('cors');
require('dotenv/config');


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