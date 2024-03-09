const express = require("express");
const router =  express.Router();
const {Course} = require('../models/course');
const mongoose = require("mongoose");
const multer = require('multer');
const { FILE } = require("dns");

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'

}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid Image type')
        if(isValid){
            uploadError = null
        }

      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
    const filename = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })



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

router.post(`/`, uploadOptions.single('image'), async (req, res) =>{

    const file = req.file;
    if (!file){
        res.status(400).json({success: false, message: "No Imagefile in request"})
    } 

    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    const course = new Course({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`,
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

router.put('/:_id', async (req, res)=>{
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
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
        imagePath
    }else{
        imagePath = Course.image;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        req.params._id,
        {
            name: req.body.name,
            description: req.body.description,
            image: `${basePath}${fileName}`,
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

module.exports = router;