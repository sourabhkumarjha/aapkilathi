const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
    phone: {type: String},
    otp:{type: Number},
    countryCode: {type: Number},
    isActive: {type: Boolean},
    isDeleted:{type: Boolean}
    
} );

const UserModel = mongoose.model('UserModel', userSchema)

module.exports = UserModel


