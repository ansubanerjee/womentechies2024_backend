const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String, 
        required: true,
    },
    image: {
        type: String,
        default: ''
    },

})
postSchema.virtual('id').get(function (){
    return this._id.toHexString()
});
postSchema.set('toJSON',{
    virtuals: true,
})
exports.Post = mongoose.model('Post', postSchema);
exports.postSchema = postSchema;