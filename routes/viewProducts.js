const express = require('express');
const Product = require('../models/Product');
const Connect = require('../models/connect')
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');


router.use(express.json());

router.get('/', isAuthenticated, async (req, res) => {
    let range = req.query.range || 'all'
    const searchTerm = req.query.search;
    if (searchTerm) {
        try {
            
            const products = await Product.find({
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { city: { $regex: searchTerm, $options: "i" } }
                ]
            });

            products.reverse()
            res.render('products', {
                products,
                title: "FARMDOR · Products",
                page: "products",
                roleheader: "company",
                range
            })
        } catch (error) {
            res.status(500).json({ message: "Error retrieving search results" });
        }
    }
    if (range !== 'all' && range !== '>100') {
        range = Number(range)
    }

    if (typeof range == 'number') {
        let longitude = req.user.location.coordinates[0]
        let latitude = req.user.location.coordinates[1]
        var products = await Product.find({
            location: {
              $near: {
                $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                $maxDistance: range *1000,
              },
            },
          });
    } else if (range === 'all') {
        var products = await Product.find({})
    }
    else if (range === '>100') {
        var products = await Product.find({ range: { $gt: 95 } })
    }
    products.reverse()
    res.render('products', {
        products,
        title: "FARMDOR · Products",
        page: "products",
        roleheader: "company",
        range
    })


})




module.exports = router