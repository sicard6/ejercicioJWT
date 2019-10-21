var express = require('express');
var router = express.Router();

var HandlerGenerator = require('../handlegenerator.js');
var middleware = require('../middleware.js');

HandlerGenerator = new HandlerGenerator();

/* GET home page. */
router.get('/', middleware.checkToken, HandlerGenerator.index);

router.get(
	'/AdminAction',
	middleware.checkTokenAdmin,
	HandlerGenerator.indexAdmin
);

router.post('/login', HandlerGenerator.login);

router.post('/CreateUser', HandlerGenerator.CreateUser);

module.exports = router;
