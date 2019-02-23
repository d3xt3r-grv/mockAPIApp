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
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
app.use(bodyParser.urlencoded({extended:false}));

app.use(cors({
	origin: true
}));

const googleUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=';


let users = db.collection('users');

app.post('/login', googleLogin);
app.get('/auth', isAuthenticated, function (req, res) {
	res.send("isAuthenticated");
})

app.post('/addAPI', isAuthenticated,addAPI);
// app.post('/exists', isAuthenticated,exists);
app.put('/addAPI',isAuthenticated,updateAPI);

app.get('/serve/*',serveGetDeleteAPI);
app.post('/serve/*',servePutPostAPI);
app.put('/serve/*',servePutPostAPI);
app.delete('/serve/*', serveGetDeleteAPI);

app.get('/se/*',urlpattern);

app.get('/myapis',isAuthenticated,myAPIs);

app.use('/', function(req, res) {
	res.json({
		status: "connected",
		message: "use another routes"
	})
})

function urlpattern(req,res){
	var arr=req.url.split('/');
	var url='';
	var len=arr.length;
	arr=arr.slice(arr.indexOf('se')+1,len);
	len=arr.length;
	var temp=arr[len-1].split('?')[0];
	arr[len-1]=temp;
	for(i=0;i<len;i++)
	url+=arr[i];
	console.log(url);
	res.send('working');

}

function addAPI(req,res)
{
	var sub=req.body.sub;
	var type= req.body.type;
	var route=req.body.route;
	route=route.replace(/\ /g,"");
	route=route.replace(/\//g, "");
	var project=req.body.project;
	project=project.replace(/\ /g,"");
	project=project.replace(/\//g, "");
	if(type=='GET')
	{
		console.log(sub+project+route+type);
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').get()
		.then((snapshot)=>{
			if(snapshot.exists)
			{
				return res.json({
					success:false,
					message:'endpoint already exists in same project'
				})
			}
			else {
				//code here
				var header=req.body.headers;
				var params=req.body.params;
				var response=req.body.response;
				var data={response:response};
				if(header!=undefined){
					data.header=header;
				}
				if(params!=undefined){
					data.params=params;
				}
				console.log(data);
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

		})
		.catch(err => {
			return res.status(400).json({
				success:false,
				message:'error from database'
			})
		})

	}
	else if (type=='POST' || type=='PUT' )
	{
		console.log(sub+project+route+type);
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').get()
		.then((snapshot)=>{
			if(snapshot.exists)
			{
				return res.json({
					success:false,
					message:'endpoint already exists in same project'
				})
			}
			else {
				//code here
				var header=req.body.headers;
				var body=req.body.body;
				var response=req.body.response;
				var data={response:response};
				if(header!=undefined){
					data.header=header;
				}
				if(body!=undefined){
					data.body=body;
				}
				console.log(data);
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
		})
		.catch(err => {
			return res.status(400).json({
				success:false,
				message:err
			})
		})
	}
	else if(type=="DELETE")
	{
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').get()
		.then((snapshot)=>{
			if(snapshot.exists)
			{
				return res.json({
					success:false,
					message:'endpoint already exists in same project'
				})
			}
			else {
				//code here
				var header=req.body.headers;
				// var body=req.body.body;
				var response=req.body.response;
				var params=req.body.params;
				// if(params===undefined)
				// {
				// 	var data={
				// 		header:header,
				// 		body:body,
				// 		response:response
				// 	}
				// }
				// else if (body==undefined) {
				var data={response:response};
				if(header!=undefined){
					data.header=header;
				}
				if(params!=undefined){
					data.params=params;
				}
				// }
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
		})
		.catch(err => {
			return res.status(400).json({
				success:false,
				message:'error from database'
			})
		})
	}
}

function updateAPI(req,res)
{
	var sub=req.body.sub;
	var type= req.body.type;
	var route=req.body.route;
	route=route.replace(/\ /g,"");
	route=route.replace(/\//g, "");
	var project=req.body.project;
	project=project.replace(/\ /g,"");
	project=project.replace(/\//g, "");
	if(type=='GET')
	{
		console.log(sub+project+route+type);
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').get()
		.then((snapshot)=>{
			if(snapshot.exists)
			{
				var header=req.body.headers;
				var params=req.body.params;
				var response=req.body.response;
				var data={response:response};
				if(header!=undefined){
					data.header=header;
				}
				if(params!=undefined){
					data.params=params;
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
					message:'GET mock updated'
				})
			}
			else {
				//code here
				return res.json({
					success:false,
					message:'endpoint does not exists in the project'
				})

			}

		})
		.catch(err => {
			return res.status(400).json({
				success:false,
				message:'error from database'
			})
		})

	}
	else if (type=='POST' || type=='PUT' )
	{
		console.log(sub+project+route+type);
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').get()
		.then((snapshot)=>{
			if(snapshot.exists)
			{
				var header=req.body.headers;
				var body=req.body.body;
				var response=req.body.response;
				var data={response:response};
				if(header!=undefined){
					data.header=header;
				}
				if(body!=undefined){
					data.body=body;
				}
				console.log(data);
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
					message:type+' mock updated'
				})

			}
			else {
				//code here
				return res.json({
					success:false,
					message:'endpoint does not exists in the project'
				})
			}
		})
		.catch(err => {
			return res.status(400).json({
				success:false,
				message:err
			})
		})
	}
	else if(type=="DELETE")
	{
		users.doc(sub).collection(project).doc(route).collection(type).doc('fields').get()
		.then((snapshot)=>{
			if(snapshot.exists)
			{
				var header=req.body.headers;
				// var body=req.body.body;
				var response=req.body.response;
				var params=req.body.params;
				// if(params===undefined)
				// {
				// 	var data={
				// 		header:header,
				// 		body:body,
				// 		response:response
				// 	}
				// }
				// else if (body==undefined) {
				var data={response:response};
				if(header!=undefined){
					data.header=header;
				}
				if(params!=undefined){
					data.params=params;
				}
				// }
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
					message:'DELETE mock updated'
				})
			}
			else {
				//code here
				return res.json({
					success:false,
					message:'endpoint does not exist in the project'
				})

			}
		})
		.catch(err => {
			return res.status(400).json({
				success:false,
				message:'error from database'
			})
		})
	}
}

function serveGetDeleteAPI(req,res)
{
	// console.log(req.url);
	// var array=req.url.split('/');
	// console.log(array);
	// console.log(req.method);
	// var a=array.indexOf('serve');
	// var cred=array.slice(array.indexOf('serve')+1,array.indexOf('serve')+4);
	// console.log(cred);
	// res.send('working');
	var url=req.url;
	var arr=(url.split('/')).slice((url.split('/')).indexOf('serve')+1,(url.split('/')).indexOf('serve')+4);
	var temp=arr[2].split('?');
	arr[2]=temp[0];
	console.log(arr);
	var sub=arr[0];
	var project=arr[1];
	// var url=arr[2];
	var array=req.url.split('/');
	var url1='';
	var len=array.length;
	array=array.slice(array.indexOf('serve')+1,len);
	len=array.length;
	var temp=array[len-1].split('?')[0];
	array[len-1]=temp;
	for(i=2;i<len;i++)
	url1+=array[i];
	// console.log(url);
	url=url1;
	console.log('\n'+sub+project+url+'\n');
	var reqHeaders=req.headers;
	var reqParams=req.query;
	console.log(reqHeaders);
	console.log(reqParams);
	users.doc(sub).collection(project).doc(url).collection(req.method).doc('fields').get()
	.then((snapshot)=>{
		if(!snapshot.exists){
			return res.status(404).json({
				error:'route undefined'
			})
		}
		else {
			console.log(snapshot.data());
			let header=snapshot.data().header;
			let params=snapshot.data().params;
			let response=snapshot.data().response;
			for(let key in header){
				if(reqHeaders[key]!==header[key]){
					console.log('invalid header');
					return res.status(400).json({
						success:false,
						message:'invalid/incomplete headers'
					})
				}
			}
			for(let key in params){
				if(reqParams[key]==null || reqParams[key]==undefined){
					console.log('missing parameter');
					return res.status(400).json({
						success:false,
						message:'missing parameters'
					})
				}
			}
			return res.status(200).json(response);
		}
	})
	.catch(err => {
		return res.json({
			err:err
		})
	})
}

function myAPIs(req, res)
{
	var sub=req.body.sub;
	users.doc(sub).get()
	.then((snapshot)=>{
		// console.log(snapshot);
		for(let snap in snapshot){
			users.doc(sub).collection(snap)
		}
	})
	.catch(err => {console.log(err);})
}

function servePutPostAPI(req,res)
{
	// console.log(req.url);
	// var array=req.url.split('/');
	// console.log(array);
	// console.log(req.method);
	// var a=array.indexOf('serve');
	// var cred=array.slice(array.indexOf('serve')+1,array.indexOf('serve')+4);
	// console.log(cred);
	// res.send('working');
	var url=req.url;
	var arr=(url.split('/')).slice((url.split('/')).indexOf('serve')+1,(url.split('/')).indexOf('serve')+4);
	var temp=arr[2].split('?');
	arr[2]=temp[0];
	console.log(arr);
	var sub=arr[0];
	var project=arr[1];
	// var url=arr[2];
	var array=req.url.split('/');
	var url1='';
	var len=array.length;
	array=array.slice(array.indexOf('serve')+1,len);
	len=array.length;
	var temp=array[len-1].split('?')[0];
	array[len-1]=temp;
	for(i=2;i<len;i++)
	url1+=array[i];
	// console.log(url);
	url=url1;
	var reqHeaders=req.headers;
	var reqBody=req.body;
	console.log(reqHeaders);
	console.log(reqBody);
	console.log(req.method);
	users.doc(sub).collection(project).doc(url).collection(req.method).doc('fields').get()
	.then((snapshot)=>{
		if(!snapshot.exists){
			return res.status(404).json({
				error:'route undefined'
			})
		}
		else {
			console.log(snapshot.data());
			let header=snapshot.data().header;
			let body=snapshot.data().body;
			let response=snapshot.data().response;
			for(let key in header){
				if(reqHeaders[key]!==header[key]){
					console.log('invalid header');
					return res.status(400).json({
						success:false,
						message:'invalid/incomplete headers'
					})
				}
			}
			for(let key in body){
				if(reqBody[key]==null || reqBody[key]==undefined){
					console.log('missing body parameter');
					return res.status(400).json({
						success:false,
						message:'missing body parameters'
					})
				}
			}
			return res.status(200).json(response);
		}
	})
	.catch(err => {
		return res.json({
			err:err
		})
	})
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
