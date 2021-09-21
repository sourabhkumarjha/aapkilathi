const testCategoryrouter = require('express').Router()
const TestCategory = require('../models/TestCategories')

testCategoryrouter.post('/addCategory', (req,res) => {
    const body = req.body
    const testCategoryDetails = {
        categoryName: body.categoryName,
        savedBy:req.user._id
    }

    const testCategory = new TestCategory(testCategoryDetails)
    testCategory.save()
        .then(()=> res.status(200).json({success: true, message: 'Data inserted'}))
        .catch(error => req.status(401).json({message:'coudnt save the data'}))

}) 

export default testCategoryrouter;