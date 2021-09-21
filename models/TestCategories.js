const mongoose = require('mongoose')
const Schema = mongoose.Schema

const testCategorySchema = new Schema({
    categoryName: {type: String},
    isActive: {type: Boolean},
    isDeleted: {type: Boolean},
    savedBy: {type: Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'User'},
}, 
{
    timestamps: true
})

const TestCategory = mongoose.model('TestCategory', testCategorySchema)


module.exports = TestCategory