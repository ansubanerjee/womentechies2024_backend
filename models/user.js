const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type:{
        type: String,
        //NAARI OR USER
    },
    category:{
        type: String,
        required: true
        //ONLY FOR NON NAARI USERS
    },

    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },  
    institution: {
        type: String,
        default: ''
        //ONLY FOR NON WOMEN USERS 
    },

    street: {
        type: String,
        default: ''
    },
    house: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    isAdmin:{
        type: String,
        default: false
    }
})


userSchema.virtual('id').get(function (){
    return this._id.toHexString()
});
userSchema.set('toJSON',{
    virtuals: true,
});


exports.User = mongoose.model('User',userSchema);
exports.userSchema = userSchema;
