const express = require('express')
const router = express.Router()
const Connect = require('../models/connect')
const {isAuthenticated, isFarmer} = require('../middleware/authMiddleware')
const Product = require('../models/Product')
const User = require('../models/User')
const {ObjectId} = require('mongodb')
const { connect } = require('mongoose')
// Farmer Dashboard route
router.get('/', isAuthenticated, isFarmer, async (req, res) => {
    const farmerName = req.user.name; // Access the farmer's name from req.user
    const farmer = req.user._id;
    const products = await Product.find({ farmer: farmer });
    const roleheader = req.user.role
    const location = [req.user.location.coordinates[0],req.user.location.coordinates[1]]
    
    res.render('dashboard', { 
      title: 'Farmer Dashboard', 
      farmerName, 
      products, 
      roleheader,
      location,
      page: 'home', 
      title: 'FARMDOR · Dashboard'  
    });
  });
  
router.get('/requests',isAuthenticated, async (req,res) => {
  const roleheader = req.user.role
  let userId = req.user._id.toString()
  let connections = await Connect.find({to: userId})
  connections.reverse()
  res.render('requests',{ 
    title: 'FARMDOR · Requests',
    roleheader,
    page: 'requests',
    connections
  })

}) 

router.post('/requests/accept',isAuthenticated,async (req,res) => {
  let fromId = req.body.from
  let to = req.body.to
  await Connect.updateOne({from: fromId, to},{status : "accepted"})
  res.json({message: "Accepted"})
})
 
router.post('/requests/reject',isAuthenticated,async (req,res) => {
  let fromId = req.body.from
  let to = req.body.to
  await Connect.updateOne({from: fromId, to},{status : "rejected"})
  res.json({message: 'Rejected'})
})

router.post('/contact',async (req,res) => {
  let fromId =new ObjectId(req.body.id)
  let user  = await User.findOne({_id : fromId})
  res.json({reciever : user.email})
})

module.exports = router