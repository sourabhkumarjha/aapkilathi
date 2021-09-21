
const mogoose = require('mongoose');
require('dotenv').config()

try{
    const connection = mogoose.connect(process.env.ATLAS_URI, { newUrlParser: true },
         () => { console.log('MongoDB database connection established successfully !') }
    )
} catch(e) {
    console.log('Could not connect')
}
