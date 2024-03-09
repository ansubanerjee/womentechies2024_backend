const express = require('express');
const bcrypt = require('bcryptjs')
const router = express.Router();
const {User} = require('../models/user');
const jwt = require('jsonwebtoken');


const multer = require('multer');
const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpeg',


};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
            const isValid = FILE_TYPE_MAP[file.mimetype]; 
            let uploadError = new Error('invalid image type')
            if(isValid){
                uploadError = null 
            }
        cb(uploadError, 'public/uploads/profile_pics')
    },
    filename: function( req, file, cb){
        
        const fileName = file.originalname.replace(' ', '_');
        const extension = FILE_TYPE_MAP[file.mimetype]; 
        cb(null, `${fileName}_${Date.now()}.${extension}`)
    }
})
var uploadOptions = multer({storage: storage});

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



router.post('/', uploadOptions.single('image'), async (req, res)=>{
    const salt = await bcrypt.genSalt();

    const file = req.file;
    if(!file){req.status(404).send('No image in request')}
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/profile_pics`;
    const user = new User({
        name: req.body.name,
        type: req.body.type,
        category: req.body.category,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password,salt),
        institution: req.body.institution,
        street: req.body.street,
        house: req.body.house,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        isAdmin: req.body.isAdmin,
        image: `${basePath}${fileName}`,
        description: req.body.description,
        isAdmin: req.body.isAdmin
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
router.post('/naari/register', async (req, res)=>{
    const salt = await bcrypt.genSalt();
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password, salt),
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


router.post('/user/register', async (req, res)=>{
    const salt = await bcrypt.genSalt();
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password, salt),
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

router.put('/:_id', uploadOptions.single('image'), async (req, res)=>{
    if (!mongoose.isValidObjectId(req.params._id)){
        return res.status(400).send('Invalid ID')
    }
    const userExist = await User.findById(req.params._id);
    if(!userExist) return res.status(400).send("Invalid User")

    const file = req.file;
    let imagepath;
    
    if(file){
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/profile_pics`;
        imagepath =  `${basePath}${fileName}`
    }else{
        imagepath = userExist.image;
    }
    const salt = await bcrypt.genSalt();
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, salt)
    } else {
        newPassword = userExist.passwordHash;
    }
    const updatedUser = await User.findByIdAndUpdate(
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
            image: imagepath 

        },
        {new: true})

        if (!updatedUser){
            res.status(400).json({success: false, message: "User was not found"});
        }
        res.status(200).send(updatedUser);

})


module.exports = router;