const mongoose = require("mongoose");


const user_categorySchema = new mongoose.Schema({
        name : {
            type: String,
            required: true
        }
})


user_categorySchema.virtual('id').get(function (){
    return this._id.toHexString()
});
user_categorySchema.set('toJSON',{
    virtuals: true,
});


exports.User_category = mongoose.model('User_Category',user_categorySchema);
exports.user_categorySchema = user_categorySchema;
