const express = require("express");
const router =  express.Router();
const {Course} = require('../models/course');
const mongoose = require("mongoose");
const multer = require('multer');
const { Product } = require("../models/product");

const FILE_TYPE_MAP = {
    'upload/mov': 'mov',
    'upload/mp4': 'mp4',
    'upload/wmv': 'wmv',
    'upload/png' : 'png',
    'upload/jpg' : 'jpg',
    'upload/jpeg' : 'jpeg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
            const isValid = FILE_TYPE_MAP[file.mimetype]; 
            let uploadError = new Error('invalid upload type')
            if(isValid){
                uploadError = null 
            }
        cb(uploadError, 'public/uploads/courses')
    },
    filename: function( req, file, cb){
        
        const fileName = file.originalname.replace(' ', '_');
        const extension = FILE_TYPE_MAP[file.mimetype]; 
        cb(null, `${fileName}_${Date.now()}.${extension}`)
    }
})
var uploadOptions = multer({storage: storage});


router.get(`/`, async (req, res) =>{
    const courseList = await Course.find();
    if (!courseList){
        res.status(500).json({success: false, message: "Courses Could Not be Fetched"});
    }
    res.send(courseList);
}) 

router.get('/:_id', async (req, res)=>{
    const course = await Course.findById(req.params._id).populate('user', 'name');
    if (!course){
        res.status(400).json({success: false, message: "Course was not found"});
    }
    res.status(200).send(course);
})

router.post(`/`, uploadOptions.single('upload'), async (req, res) =>{

    const file = req.file;
    if (!file){
        res.status(400).json({success: false, message: "No Imagefile in request"})
    } 
    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/courses`;
    const course = new Course({
        name: req.body.name,
        description: req.body.description,
        upload: `${basePath}${fileName}`,
        price: req.body.price,
        content: req.body.content,

    })
    await course.save();
    try{
        if (course){
            res.status(201).send(course)
        }
        if(!course){
            res.status(400).json({ message: "Course could not be created", success: false})
        }
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
  })

router.put('/:_id', uploadOptions.single('upload'), async (req, res)=>{
    if(!mongoose.isValidObjectId(req.params._id)){
        res.status(400).json({success: false, message: "Invalid Course ID"})
    }
    const courseCheck = await Product.findById(req.params.id);
    if(!courseCheck){
        res.status(400).json({success: false, message: "Invalid Course"})
    }
    const file = req.file;
    let imagePath;

    if (file){
        const fileName  = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/courses`;
        imagePath `${basePath}${fileName}`
    }else{
        imagePath = courseCheck.image;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        req.params._id,
        {
            name: req.body.name,
            description: req.body.description,
            image: imagePath,
            price: req.body.price,
            content: req.body.content,
        }, {new: true})

    if (!updatedCourse){
        return res.status(500).send('The Course could not be Updated')
    }
    res.send(updatedCourse);
})


router.delete('/:_id', async (req,res)=>{
    const course = await findByIdAndDelete(req.params._id)
    try{
        if (!course){
            res.status(404).json({ success: false, message: "Course was not found"})
        }
        res.status(200).json({ success: true, message: "Course was Deleted"})
    }catch(err){
        res.status(400).json({ success: false, error: err})
    }
})

router.get('/get/count', async (req, res)=>{
    const courseCount = await Course.countDocuments({})
    if (!courseCount){
        res.status(404).json({ success: false, message: "Course was not found"})
    }
    res.status(200).send({
        count: courseCount
    })
})


router.put('/course-content/:_id', 
uploadOptions.array('image',100), 
async (req, res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Course ID')
    }
    const files = req.files
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/courses`;

    if (files){
        files.map(file =>
            imagePaths.push(`${basePath}${file.fileName}`)
            )}

    const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
            upload: uploadPaths
        }, {new: true}
    )
    if (!course){
        return res.status(500).send('Course cannot be updated')
    }
    res.send(course);

})
module.exports = router;