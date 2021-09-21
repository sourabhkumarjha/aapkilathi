const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userTestsSchema = new Schema({
    ProfileId: {type: StringSchema.Types.ObjectId, ref:'UserProfile'},
    TestId: {type: Schema.Types.ObjectId, ref: 'Test' },
    isdeleted: {type: Boolean},
    testResult:{type:String},
    saveBy:{type: Schema.Types.ObjectId, ref: 'User'},
    updatedBy:{type:Schema.Types.ObjectId, ref: 'User'}
    
} );

const userTest = mongoose.model('userTest', userTestsSchema)

module.exports = userTest