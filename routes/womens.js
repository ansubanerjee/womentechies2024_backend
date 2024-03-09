const express = require('express');
const bcrypt = require('bcryptjs')
const router = express.Router();
const {Women} = require('../models/women');
const jwt = require('jsonwebtoken');
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

router.get('/', async (req,res)=>{
    const WomenList = await Women.find().select('-passwordHash');
    try{
        if(!WomenList){
            res.status(404).json({success: false, message: "User Cannot Be Fetched"});
        }
        res.status(200).send(WomenList);
    }catch(err){
        res.status(500).json({success: false, error: err})
    }  
})


router.get(`/:_id`, async (req, res) =>{
    const women = await Women.findById(req.params._id).select('-passwordHash');

    if (!women){
        res.status(500).json({success: false, message: "User was not found"})
    }
    res.status(200).send(women);
})



router.post('/', async (req, res)=>{
    const salt = await bcrypt.genSalt();
    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    const women = new Women({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password,salt),
        house: req.body.house,
        street: req.body.street,
        city: req.body.city,
        zip: req.body.zip,
        image: `${basePath}${fileName}`,
    })
    await women.save();
    try{
        if(!women){
        return res.status(400).send({ message: "User could not be created", success: false})
        }res.status(201).send(women)
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
})



//Login
router.post('/login', async (req, res)=>{
    const women = await Women.findOne({email: req.body.email})
    const secret = process.env.secret;
    try{
        if (!women){
            res.status(404).json({success: false, message: "User was not found"});
        }
        if (women && bcrypt.compareSync(req.body.password, women.passwordHash)){
            const token = jwt.sign(
                {
                    womenId : women.id
                   
                }, secret,{
                    expiresIn: '1d'
                }
            )
            res.status(200).send({user: women.email, token: token})
        }else{
            res.status(400).json({success: false, message: "Password is Wrong"})
        }
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
})



//Register
router.post('/register', async (req, res)=>{
    const salt = await bcrypt.genSalt();
    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    const women = new women({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password,salt),
        house: req.body.house,
        street: req.body.street,
        city: req.body.city,
        zip: req.body.zip,
        image: `${basePath}${fileName}`,  
    })
    await women.save();
    try{
        if(!women){
        return res.status(400).send({ message: "User could not be created", success: false})
        }res.status(201).send(women)
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
})



router.get('/get/count', async (req, res)=>{
    const womenCount = await Women.countDocuments({})
    if (!womenCount){
        res.status(404).json({ success: false, message: "Users were not found"})
    }
    res.status(200).send({
        count: womenCount
    })
})


router.delete('/:_id', async (req,res)=>{
    const women = await findByIdAndDelete(req.params._id)
    try{
        if (!women){
            res.status(404).json({ success: false, message: "User was not found"})
        }
        res.status(200).json({ success: true, message: "User was Deleted"})
    }catch(err){
        res.status(400).json({ success: false, error: err})
    }
})

router.put('/:_id', async (req, res)=>{
    const salt = await bcrypt.genSalt();
    const womenExist = await Women.findById(req.params.id);
    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, salt)
    } else {
        newPassword = womenExist.passwordHash;
    }
    const women = await Women.findByIdAndUpdate(
        req.params._id, 
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            passwordHash: bcrypt.hashSync(req.body.password,salt),
            house: req.body.house,
            street: req.body.street,
            city: req.body.city,
            zip: req.body.zip,
            image: `${basePath}${fileName}`,

        },
        {new: true})

        if (!women){
            res.status(400).json({success: false, message: "User was not found"});
        }
        res.status(200).send(user);

})


module.exports = router;