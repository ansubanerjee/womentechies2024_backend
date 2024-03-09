
const express = require('express');
const router = express.Router();
const {Order} = require('../models/order');
const {OrderItem} = require('../models/order-item');


router.get(`/`, async (req, res)=>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});
    try{
        if(!orderList){
            res.status(500).json({ success: false, message: "Order List was not found"})
        }
        res.status(200).send(orderList)
    }catch(err){
        res.status(500).json({ success: false, error: err})

    }
    
})

router.get(`/:_id`, async (req, res)=>{
    const order = await Order.findById(req.params._id).populate('user', 'name').populate({path: 'orderItems', populate: {populate: 'product'}});
    try{
        if(!order){
            res.status(500).json({ success: false, message: "Order was not found"})
        }
        res.status(200).send(order)
    }catch(err){
        res.status(500).json({ success: false, error: err})

    }
    
})


router.post('/', async (req, res)=>{

    const orderItemIds = Promise.all(req.body.orderItems.map(async orderItem =>{
        let newOrderItem = new OrderItem({
            product: orderItem.product,
            quantity: orderItem.quantity
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
        
    }))
    const orderItemIdsResolved = await orderItemIds;

    const totalPrices = await Promise.all(orderItemIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');

        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
        }))
    const totalPrice = totalPrices.reduce((a,b) => a+b, 0)

    const order = new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    })
    await order.save();
    
    try{
        if(!order){
            return res.status(404).send('Order cannot be created')}
        res.status(200).send(order);
    }catch(err){
        return res.status(500).json({ success: false, error: err})
    }
    
})

router.put('/:_id', async (req, res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params._id, 
        {
            status: req.body.status,
        },
         {new: true})
        if (!order){
            res.status(400).json({success: false, message: "Order was not found"});
        }
        res.status(200).send(order);

})
 
router.delete('/:_id', async(req, res)=>{

    Order.findByIdAndDelete(req.params._id).then(async order =>{
        try{    
            if(order){
                await order.orderItems.map(async orderItem => {
                    await OrderItem.findByIdAndDelete(orderItem)
                })
                return res.status(200).json({success: true, message: "order is deleted"})
            }
            else {
                return res.status(404).json({success: false, message: "order is not found"})
            }}
        catch(err){
            return res.status(400).json({success: false, error: err})
        }
    });
    
})
router.get('/get/totalsales', async (req, res) =>{
    const totalSales = await Order.aggregate([
        { $group : {_id: null, totalsales : {$sum: '$totalPrice'}}}
    ])
    if (!totalSales){
            return res.status(404).json({ success: false, message: "Total Sales cannot be generated"})
    }res.status(200).send({ totalsales : totalSales.pop().totalsales})
})

router.get('/get/count', async (req, res)=>{
    const orderCount = await Order.countDocuments({})
    if (!orderCount){
        res.status(404).json({ success: false, message: "Order was not found"})
    }
    res.status(200).send({
        count: orderCount
    })
})

router.get(`/get/userorders/:userid`, async (req, res)=>{
    const userorderList = await Order.find({user: req.params.userid}).populate({path: 'orderItems', populate: {path : 'product', populate: 'category'}}).sort({'dateOrdered': -1});
    try{
        if(!userorderList){
            res.status(500).json({ success: false, message: "User Order List was not found"})
        }
        res.status(200).send(userorderList)
    }catch(err){
        res.status(500).json({ success: false, error: err})

    }
    
})
module.exports = router; 