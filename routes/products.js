const express = require("express");
const router =  express.Router();
const {Product} = require('../models/product');
const mongoose = require("mongoose");
const multer = require('multer');

const FILE_TYPE_MAP = {
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
        cb(uploadError, 'public/uploads/products')
    },
    filename: function( req, file, cb){
        
        const fileName = file.originalname.replace(' ', '_');
        const extension = FILE_TYPE_MAP[file.mimetype]; 
        cb(null, `${fileName}_${Date.now()}.${extension}`)
    }
})
var uploadOptions = multer({storage: storage});


router.get(`/`, async (req, res) =>{
    const productList = await Product.find();
    if (!productList){
        res.status(500).json({success: false, message: "Products Could Not be Fetched"});
    }
    res.send(productList);
}) 

router.get('/:_id', async (req, res)=>{
    const product = await Product.findById(req.params._id).populate('user', 'name');
    if (!product){
        res.status(400).json({success: false, message: "Product was not found"});
    }
    res.status(200).send(product);
})

router.post(`/`,uploadOptions.single('image'), async (req, res) =>{
    const file = req.file;
    if(!file){req.status(404).send('No upload in request')}
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/products`;
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        upload: `${basePath}${fileName}`,
        price: req.body.price,
        countInStock: req.body.countInStock,

    })
    await product.save();
    try{
        if (product){
            res.status(201).send(product)
        }
        if(!product){
            res.status(400).json({ message: "Product could not be created", success: false})
        }
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
  })


router.put('/:_id',uploadOptions.single('image'), async (req, res)=>{
    if(!mongoose.isValidObjectId(req.params._id)){
        res.status(400).json({success: false, message: "Invalid Product ID"})
    }
    const productcheck = await Product.findById(req.params.id);
    if(!productcheck){
        res.status(400).json({success: false, message: "Invalid Product"})
    }
    const file = req.file;
    let imagepath;

    if(file){
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/products`;
        imagepath =  `${basePath}${fileName}`
    }else{
        imagepath = productcheck.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params._id,
        {
            name: req.body.name,
            description: req.body.description,
            image: imagepath,
            price: req.body.price,
            countInStock: req.body.countInStock,
        }, {new: true})

    if (!updatedProduct){
        return res.status(500).send('The Product could not be Updated')
    }
    res.send(updatedProduct);
})


router.delete('/:_id', async (req,res)=>{
    const product = await findByIdAndDelete(req.params._id)
    try{
        if (!product){
            res.status(404).json({ success: false, message: "Product was not found"})
        }
        res.status(200).json({ success: true, message: "Product was Deleted"})
    }catch(err){
        res.status(400).json({ success: false, error: err})
    }
})

router.get('/get/count', async (req, res)=>{
    const productCount = await Product.countDocuments({})
    if (!productCount){
        res.status(404).json({ success: false, message: "Product was not found"})
    }
    res.status(200).send({
        count: productCount
    })
})

module.exports = router;