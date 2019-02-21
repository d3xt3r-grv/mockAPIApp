const admin = require('firebase-admin');
const functions = require('firebase-functions');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const config = require('./config');
const isAuthenticated = require('./middlewares/auth');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const app = express();
app.use(bodyParser.urlencoded({extended:false}));


const googleUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=';

app.use(cors({
	origin: true
}));

let users = db.collection('users');

app.post('/login', googleLogin);
app.get('/auth', isAuthenticated, function (req, res) {
	res.send("isAuthenticated");
})

app.post('/addAPI', isAuthenticated,addAPI);

app.use('/', function(req, res) {
	res.json({
		status: "connected",
		message: "use another routes"
	})
})
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

function addAPI(req,res)
{
	var sub=req.body.sub;
	var type= req.body.type;
	var route=req.body.route;
	var project=req.body.project;
	if(type=='GET')
	{
		var header=req.body.headers;
		var params=req.body.params;
		var response=req.body.response;
		var data={
			header:header,
			params:params,
			response:response
		}
		if(sub==undefined || project==undefined||route==undefined||type==undefined)
		{
			return res.send(400).json({
				success:false,
				message:'incomplete parameters'
			})
		}
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').set(data);
		return res.status(200).json({
			success:true,
			message:'GET mock created'
		})
	}
	else if (type=='POST' || 'PUT' )
	{
		var header=req.body.headers;
		var body=req.body.body;
		var response=req.body.response;
		var data={
			header:header,
			body:body,
			response:response
		}
		if(sub==undefined || project==undefined||route==undefined||type==undefined)
		{
			return res.send(400).json({
				success:false,
				message:'incomplete parameters'
			})
		}
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').set(data);
		return res.status(200).json({
			success:true,
			message:type+' mock created'
		})
	}
	else if(type=="DELETE")
	{
		var header=req.body.headers;
		var body=req.body.body;
		var response=req.body.response;
		var params=req.body.params;
		var data={
			header:header,
			body:body,
			params:params,
			response:response
		}
		if(sub==undefined || project==undefined||route==undefined||type==undefined)
		{
			return res.send(400).json({
				success:false,
				message:'incomplete parameters'
			})
		}
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').set(data);
		return res.status(200).json({
			success:true,
			message:'DELETE mock created'
		})
	}
}

function googleLogin(req, response) {

	let idToken = req.body.idToken;						// get idToken
	if(idToken === undefined) {							// if idToken is not sent in request

		return response.status(400).json({					// bad request
			success: false,
			message: "Usage: [POST] idToken=token"
		})
	}

	request(googleUrl + idToken, {json: true}, (err, res, body) => {			// request google api for user data

		if(err) {														// error in request
			return response.status(406).json({
				success: false,
				message: "could not make request to google",
				err: err
			})
		}

		// console.log(body);

		if(body.error_description !== undefined) {				// error in idToken
																// so user error_description is retuned in the body
			return response.status(400).json({					// unauthenticated requeest
				message: "empty/invalid token",
				error: 'unauthenticated request',
				success: false,
			})
		}

		let sub = body.sub;									// user UID
		let name = body.name;								// user name
		let email = body.email;								// user email

		// console.log(sub, name, email, picture);

		users.doc(body.sub).get()							// get user data from the database
		.then((snapshot) => {
			// console.log(snapshot.data());

			if(snapshot.data() === undefined) {				// if this is a new user
				console.log(snapshot.exists);
				let userData = {							// set userData
					name: name,
					sub: sub,
					email: email,
				}

				users.doc(sub).set(userData);				// insert new user data in database

				const token = jwt.sign(userData, config.key);		// generate jwt token for user

				let data = {token: token};

				return response.status(200).json({			// send response to client
					success: true,
					data: data
				})
			}
			else {											// user already exists

				let userData = {								// set user data
					name: snapshot.data().name,
					sub: snapshot.data().sub,
					email: snapshot.data().email,
				}



				const token = jwt.sign(userData, config.key);			// generate jwt token

				let data = {token: token};

				return response.status(200).json({						// send response to client
					success: true,
					onBoard: snapshot.data().onBoard,
					data: data
				})
			}
		})
		.catch((err) => {

			return response.status(500).json({
				success: false,
				message: "could not fetch user data",
				err: err
			})

		})
	})
}

// export functions
exports.api = functions.https.onRequest(app);
