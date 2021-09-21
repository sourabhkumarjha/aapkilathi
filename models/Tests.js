const mongoose = require('mongoose')
const Schema = mongoose.Schema
const TestSchema = new Schema({
    categoryid: {type: Schema.Types.ObjectId, ref:'TestCategory'},
    testName: {type: String },
    measurementUnit: {type: String},
    minValue:{type: Number},
    maxValue:{type: Number},
    isActive:{type: Boolean},
    isDeleted:{type: Boolean},
    saveBy:{type: Schema.Types.ObjectId, ref: 'User'},
    updatedBy:{type: Schema.Types.ObjectId, ref: 'User'},

}, 
{
    timestamps: true
})

const Test = mongoose.model('Test', TestSchema)

module.exports = Test