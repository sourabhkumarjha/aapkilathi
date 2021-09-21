const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userprofileSchema = new Schema({
    userid: {type: Schema.Types.ObjectId, ref:'User'},
    FirstName: {type: String},
    LastName: {type: String},
    ProfileImage:{type: String},
    Gender:{type: String},
    DateOfBirth:{type: Date}
    
} );

const UserProfile = mongoose.model('UserProfile', userprofileSchema)

module.exports = UserProfile