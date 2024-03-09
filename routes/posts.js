const express = require('express');
const router = express.Router();
const {Post} = require('../models/post');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'upload/png' : 'png',
    'upload/jpg' : 'jpg',
    'upload/jpeg' : 'jpeg',
    'upload/mov': 'mov',
    'upload/mp4': 'mp4',
    'upload/wmv': 'wmv',


};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
            const isValid = FILE_TYPE_MAP[file.mimetype]; 
            let uploadError = new Error('invalid upload type')
            if(isValid){
                uploadError = null 
            }
        cb(uploadError, 'public/uploads/posts')
    },
    filename: function( req, file, cb){
        
        const fileName = file.originalname.replace(' ', '_');
        const extension = FILE_TYPE_MAP[file.mimetype]; 
        cb(null, `${fileName}_${Date.now()}.${extension}`)
    }
})
var uploadOptions = multer({storage: storage});


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

router.post('/', uploadOptions.single('upload'), async (req, res)=>{
    const file = req.file;
    if(!file){req.status(404).send('No upload in request')}
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/posts`;
    const post = new Post({
        title: req.body.title,
        description: req.body.description,
        upload: `${basePath}${fileName}`,
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