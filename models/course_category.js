const mongoose = require("mongoose");


const course_categorySchema = new mongoose.Schema({
        name : {
            type: String,
            required: true
        }
})


course_categorySchema.virtual('id').get(function (){
    return this._id.toHexString()
});
course_categorySchema.set('toJSON',{
    virtuals: true,
});


exports.Course_category = mongoose.model('Course_Category',course_categorySchema);
exports.course_categorySchema = course_categorySchema;
