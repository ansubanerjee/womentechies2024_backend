const mongoose = require('mongoose');


const db_url = "mongodb+srv://ansubanerjee:5LxgQpR6JlsUYwWw@clusterdefault.gwmc44z.mongodb.net/WomanTechies2024?retryWrites=true&w=majority&appName=clusterdefault";

const connectionParams = {
    useNewUrlParser : true,
    useUnifiedTopology : true
}

mongoose.connect(db_url, connectionParams).then(()=>{
    console.log("Connected to the DB")
}).catch((e)=>{
    console.log("Error: ", e)
});