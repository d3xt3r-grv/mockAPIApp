const jwt = require('jsonwebtoken');
const config = require('../config');

const isAuthenticated = function (req, res, next) {

	const token = req.headers.authorization;

	if(token) {

		jwt.verify(token, config.key, (err, data) => {

			if(err) {

				return res.status(401).json({
		        	success: false,
		        	err: 'unauthenticated request'
		        })
			}

			req.body.sub = data.sub;
			req.body.email = data.email;
			req.body.name=data.name;

			return next();

		})
	}
	else {

		return res.status(401).json({
			success: false,
			err: "unauthenticated request"
		})
	}
}

module.exports = isAuthenticated;
