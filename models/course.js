const mongoose = require("mongoose")

const courseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    
    image: {
        type: String,
        default:''
    },
    content: [{
        type: String,
    }],
    
    price: {
        type: Number,
        default: 0

    },
    
    dateCreated: {
        type: Date,
        default: Date.now
    },
})

courseSchema.virtual('id').get(function (){
    return this._id.toHexString()
});
courseSchema.set('toJSON',{
    virtuals: true,
})
exports.Course = mongoose.model('Course',courseSchema )
