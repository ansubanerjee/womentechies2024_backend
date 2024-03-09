const express = require('express');
const router = express.Router();
const {User_Category} = require('../models/user_category');

router.get(`/`, async (req, res) =>{
    const categoryList = await User_Category.find();

    if (!categoryList){
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
})

router.get(`/:_id`, async (req, res) =>{
    const category = await User_Category.findById(req.params._id);

    if (!category){
        res.status(500).json({success: false, message: "User Category was not found"})
    }
    res.status(200).send(category);
})


router.post('/', async (req, res)=>{
    const category = new User_Category({
        name: req.body.name,

    })
    await category.save();
    if(!category){
    return res.status(404).send('User Category cannot be created')}
    res.send(category);
})
router.put('/:_id', async (req, res)=>{
    const category = await User_Category.findByIdAndUpdate(
        req.params._id, 
        {
            name: req.body.name,

        }, {new: true})
        if (!category){
            res.status(400).json({success: false, message: "User Category was not found"});
        }
        res.status(200).send(category);

})
 
router.delete('/:_id', async(req, res)=>{

    const category = await User_Category.findByIdAndDelete(req.params._id);
    try{    
        if(category){
            return res.status(200).json({success: true, message: "User category is deleted"})
        }
        else {
            return res.status(404).json({success: false, message: "User category is not found"})
        }}
    catch(err){
        return res.status(400).json({success: false, error: err})
    }
})


module.exports = router;
