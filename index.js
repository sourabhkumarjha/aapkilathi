
// require('./dbconf')
const UserModel = require('./models/Users')
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const crypto = require('crypto');
const smsKey = process.env.SMS_SECRET_KEY;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;
const jwt = require('jsonwebtoken');
const { Console } = require('console');

const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;
let refreshTokens = [];

const app = express();
app.use(express.json());

const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully !');
});

app.use(cors({ origin: '/', credentials: true }));
app.use(cookieParser());
app.post('/sendOTP', (req, res) => {
	const phone = req.body.phone;
	const otp = Math.floor(100000 + Math.random() * 900000);
	const ttl = 2 * 60 * 1000;
	const expires = Date.now() + ttl;
	const data = `${phone}.${otp}.${expires}`;
	const hash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
	const fullHash = `${hash}.${expires}`;

	client.messages
		.create({
			body: `Your One Time Login Password For CFM is ${otp}`,
			from: '+15204471245',
			to: phone
		})
		.then((messages) => console.log(messages))
		.catch((err) => console.error(err));

	// res.status(200).send({ phone, hash: fullHash, otp });  // this bypass otp via api only for development instead hitting twilio api all the time
	res.status(200).send({ phone, hash: fullHash });          // Use this way in Production
});

app.post('/verifyOTP', async (req, res) => {
	const phone = req.body.phone;
	const hash = req.body.hash;
	const otp = req.body.otp;
	let [ hashValue, expires ] = hash.split('.');

	let now = Date.now();
	if (now > parseInt(expires)) {
		return res.status(504).send({ msg: 'Timeout. Please try again' });
	}
	let data = `${phone}.${otp}.${expires}`;
	let newCalculatedHash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
	if (newCalculatedHash === hashValue) {
		console.log('user confirmed');
		const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, { expiresIn: '120s' });
		const refreshToken = jwt.sign({ data: phone }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
		refreshTokens.push(refreshToken);
		const userDetails = {phone}
        const user = new UserModel(userDetails)
		console.log('User',user)
        user.save().then(() => {

			res
				// .status(202)
				// .cookie('accessToken', accessToken, {
				// 	expires: new Date(new Date().getTime() + 30 * 1000),
				// 	sameSite: 'strict',
				// 	httpOnly: true
				// })
				// .cookie('refreshToken', refreshToken, {
				// 	expires: new Date(new Date().getTime() + 15204471245),
				// 	sameSite: 'strict',
				// 	httpOnly: true
				// })
				// .cookie('authSession', true, { expires: new Date(new Date().getTime() + 30 * 1000), sameSite: 'strict' })
				// .cookie('refreshTokenID', true, {
				// 	expires: new Date(new Date().getTime() + 15204471245),
				// 	sameSite: 'strict'
				// })
				.send({ msg: 'Device verified' });
		}).catch(e => {
           console.log('e', e)
		})
	} else {
		console.log('not authenticated');
		return res.status(400).send({ verification: false, msg: 'Incorrect OTP' });
	}
});

app.post('/UserProfiles', authenticateUser, (req, res) => {
	console.log('home private route');
	res.status(202).send('Private Protected Route - Home');
});

async function authenticateUser(req, res, next) {
	const accessToken = req.cookies.accessToken;

	jwt.verify(accessToken, JWT_AUTH_TOKEN, async (err, phone) => {
		if (phone) {
			req.phone = phone;
			next();
		} else if (err.message === 'TokenExpiredError') {
			return res.status(403).send({
				success: false,
				msg: 'Access token expired'
			});
		} else {
			console.log(err);
			return res.status(403).send({ err, msg: 'User not authenticated' });
		}
	});
}

app.post('/refresh', (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) return res.status(403).send({ message: 'Refresh token not found, login again' });
	if (!refreshTokens.includes(refreshToken))
		return res.status(403).send({ message: 'Refresh token blocked, login again' });

	jwt.verify(refreshToken, JWT_REFRESH_TOKEN, (err, phone) => {
		if (!err) {
			const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, {
				expiresIn: '30s'
			});
			return res
				.status(200)
				.cookie('accessToken', accessToken, {
					expires: new Date(new Date().getTime() + 30 * 1000),
					sameSite: 'strict',
					httpOnly: true
				})
				.cookie('authSession', true, {
					expires: new Date(new Date().getTime() + 30 * 1000),
					sameSite: 'strict'
				})
				.send({ previousSessionExpired: true, success: true });
		} else {
			return res.status(403).send({
				success: false,
				msg: 'Invalid refresh token'
			});
		}
	});
});

app.get('/logout', (req, res) => {
	res
		.clearCookie('refreshToken')
		.clearCookie('accessToken')
		.clearCookie('authSession')
		.clearCookie('refreshTokenID')
		.send('logout');
});
app.listen(process.env.PORT || 4000 );


// const userRouter = require('express').Router()
// const User = require('../models/Users')
// const jwt = require('jsonwebtoken')

// userRouter.post('/add', (req, res) => {
//     const body = req.body
//     const otp = Math.floor(100000 + Math.random() * 900000)
//     const userDetails = {
//         phone: body.phone,
//         countryCode: body.countryCode,
//         otp
//     }

//     const user = new User(userDetails)
//     user.save()
//     .then((user) => {
//         res.status(200).json({ success: true, user, message: "OTP Sent !" })
//     })
//     .catch(error => res.status(401)
//     .json({ success: false, message: "Could not Send OTP", error: error.message }))
// })

// userRouter.post('/verifyOtp', (req, res) => {
//     const otp = req.body.otp
//     const 
// })



// const express = require ('express');
// const cors = require('cors')

// const app = express();

// app.use(cors())
// app.use(express.json())

// //ROUTES

// app.get('/Login', (req,res) => {
//     res.send("Login")
// });

// const testCategoryrouter = require('./controllers/TestCategory')
// app.use('/testcategory', testCategoryrouter)



// const PORT = process.env.PORT || 5000

// // Server Start Setting 
// app.listen(PORT, () => {
//     console.log(`Server started running on port: ${PORT}`)
// });



