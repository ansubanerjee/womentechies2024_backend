const mongoose = require("mongoose");


const womenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    zip: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
})


womenSchema.virtual('id').get(function (){
    return this._id.toHexString()
});
womenSchema.set('toJSON',{
    virtuals: true,
});


exports.Women = mongoose.model('Women',womenSchema);
exports.womenSchema = womenSchema;
