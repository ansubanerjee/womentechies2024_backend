
//IMPORTS
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require("morgan");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");


//SCHEMA
const Women = require('./models/women');
const User_category = require('./models/user_category');
const User = require('./models/user');
const Product = require('./models/product');
const Post = require('./models/post');
const Order = require('./models/order');
const Order_items = require('./models/order-item');
const Course = require('./models/course');


//GENERAL
require('dotenv/config');
app.use(cors());
const api = process.env.API_URL;
const womensRouter = require('./routes/womens');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const productsRouter = require('./routes/products');
const coursesRouter = require('./routes/courses');
const ordersRouter = require('./routes/orders');


//MIDDLEWARE
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

//ROUTERS
app.use(`${api}/womens`, womensRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/posts`, postsRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/courses`, coursesRouter)
app.use(`${api}/orders`, ordersRouter)



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