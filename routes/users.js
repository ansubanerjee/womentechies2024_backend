const express = require('express');
const bcrypt = require('bcryptjs')
const router = express.Router();
const {User} = require('../models/user');
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
    const UserList = await User.find().select('-passwordHash');
    try{
        if(!UserList){
            res.status(404).json({success: false, message: "Users Cannot Be Fetched"});
        }
        res.status(200).send(UserList);
    }catch(err){
        res.status(500).json({success: false, error: err})
    }  
})


router.get(`/:_id`, async (req, res) =>{
    const user = await User.findById(req.params._id).select('-passwordHash');

    if (!user){
        res.status(500).json({success: false, message: "User was not found"})
    }
    res.status(200).send(user);
})



router.post('/', async (req, res)=>{
    const salt = await bcrypt.genSalt();
    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    const user = new User({
        name: req.body.name,
        category: req.body.category,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password,salt),
        institution: req.body.institution,
        city: req.body.city,
        state: req.body.state,
        image: `${basePath}${fileName}`,
        isAdmin: req.body.isAdmin,
    })
    await user.save();
    try{
        if(!user){
        return res.status(400).send({ message: "User could not be created", success: false})
        }res.status(201).send(user)
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
})



//Login
router.post('/login', async (req, res)=>{
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    try{
        if (!user){
            res.status(404).json({success: false, message: "User was not found"});
        }
        if (user && bcrypt.compareSync(req.body.password, user.passwordHash)){
            const token = jwt.sign(
                {
                    userId : user.id,
                    isAdmin : user.isAdmin
                   
                }, secret,{
                    expiresIn: '1d'
                }
            )
            res.status(200).send({user: user.email, token: token})
        }else{
            res.status(400).json({success: false, message: "Password is Wrong"})
        }
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
})


    
//Register
router.post('/register', async (req, res)=>{
    console.log(req.body)
    const salt = await bcrypt.genSalt();
    const user = new User({
        name: req.body.name,
        category: req.body.category,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password, salt),
        institution: req.body.institution,
        city: req.body.city,
        state: req.body.state,
        isAdmin: req.body.isAdmin,  
    })
    await user.save();
    try{
        if(!user){
        return res.status(400).send({ message: "User could not be created", success: false})
        }res.status(201).send(user)
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
})



router.get('/get/count', async (req, res)=>{
    const userCount = await User.countDocuments({})
    if (!userCount){
        res.status(404).json({ success: false, message: "Users were not found"})
    }
    res.status(200).send({
        count: userCount
    })
})


router.delete('/:_id', async (req,res)=>{
    const user = await findByIdAndDelete(req.params._id)
    try{
        if (!user){
            res.status(404).json({ success: false, message: "User was not found"})
        }
        res.status(200).json({ success: true, message: "User was Deleted"})
    }catch(err){
        res.status(400).json({ success: false, error: err})
    }
})

router.put('/:_id', async (req, res)=>{
    const userExist = await User.findById(req.params.id);
    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    const salt = await bcrypt.genSalt();
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, salt)
    } else {
        newPassword = userExist.passwordHash;
    }
    const user = await User.findByIdAndUpdate(
        req.params._id, 
        {
            name: req.body.name,
            category: req.body.category,
            email: req.body.email,
            phone: req.body.phone,
            passwordHash: bcrypt.hashSync(req.body.password,salt),
            institution: req.body.institution,
            city: req.body.city,
            state: req.body.state,
            image: `${basePath}${fileName}`,

        },
        {new: true})

        if (!user){
            res.status(400).json({success: false, message: "User was not found"});
        }
        res.status(200).send(user);

})


module.exports = router;