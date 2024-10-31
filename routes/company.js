const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const Connect = require('../models/connect')
const { isAuthenticated, isCompany } = require('../middleware/authMiddleware')
const User = require('../models/User')
const { ObjectId } = require("mongodb")


router.get('/', isAuthenticated, isCompany, async (req, res) => {
    const companyName = req.user.name; 
    const location = req.user.location; 
    const roleheader = req.cookies.role
    const companyId = req.user._id.toString()
    const longitude = req.user.location.coordinates[0]
    const latitude = req.user.location.coordinates[1]
    const products = await Product.find({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                $maxDistance: 25 * 1000,
            },
        },
    }); 

    let requests = await Connect.find({ from: companyId })
    res.render('companyDashboard', {
        companyName,
        location,
        roleheader,
        page: 'home',
        title: 'FARMDOR · Company Dashboard',
        requests,
        products
    });
})

router.post('/contact', isAuthenticated, async (req, res) => {
    let fromId = new ObjectId(req.body.id)
    let user = await User.findOne({ _id: fromId })
    res.json({ reciever: user.email })
})


module.exports = router