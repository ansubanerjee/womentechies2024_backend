const express = require('express');
const router = express.Router();
const {Post} = require('../models/post');
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


router.get(`/`, async (req, res)=>{
    const postList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});
    try{
        if(!postList){
            res.status(500).json({ success: false, message: "Posts was not found"})
        }
        res.status(200).send(postList)
    }catch(err){
        res.status(500).json({ success: false, error: err})

    }
    
})

router.get(`/:_id`, async (req, res)=>{
    const post = await Order.findById(req.params._id).populate('user', 'name');
    try{
        if(!post){
            res.status(500).json({ success: false, message: "Post was not found"})
        }
        res.status(200).send(post)
    }catch(err){
        res.status(500).json({ success: false, error: err})

    }
    
})

router.post('/', async (req, res)=>{
    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    const post = new Post({
        title: req.body.title,
        description: req.body.description,
        image: `${basePath}${fileName}`,
    })
    await post.save();
    try{
        if(!post){
        return res.status(400).send({ message: "Post could not be created", success: false})
        }res.status(201).send(post)
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
})

router.get('/get/count', async (req, res)=>{
    const postCount = await Post.countDocuments({})
    if (!postCount){
        res.status(404).json({ success: false, message: "Post was not found"})
    }
    res.status(200).send({
        count: postCount
    })
})


router.delete('/:_id', async (req,res)=>{
    const post = await findByIdAndDelete(req.params._id)
    try{
        if (!post){
            res.status(404).json({ success: false, message: "Post was not found"})
        }
        res.status(200).json({ success: true, message: "Post was Deleted"})
    }catch(err){
        res.status(400).json({ success: false, error: err})
    }
})

module.exports = router;