const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User_category'
    }],

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
    },
    city: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
})


userSchema.virtual('id').get(function (){
    return this._id.toHexString()
});
userSchema.set('toJSON',{
    virtuals: true,
});


exports.User = mongoose.model('User',userSchema);
exports.userSchema = userSchema;
