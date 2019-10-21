let jwt = require('jsonwebtoken');
let config = require('./config');
const MongoClient = require('mongodb').MongoClient;
var md5 = require('md5');

var conn = MongoClient.connect('mongodb://localhost:27017/', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

// Clase encargada de la creación del token
class HandlerGenerator {
	async CreateUser(req, res) {
		let client = await conn;

		let user = req.body;
		user.password = md5(user.password);

		let info = await client
			.db('Users')
			.collection('users')
			.insertOne(req.body);

		res.json({
			message: info
		});
	}

	async login(req, res) {
		// Extrae el usuario y la contraseña especificados en el cuerpo de la solicitud
		let username = req.body.username;
		let password = md5(req.body.password);

		// Este usuario y contraseña, en un ambiente real, deben ser traidos de la BD
		let client = await conn;

		let data = await client
			.db('Users')
			.collection('users')
			.find({ username: username, password: password })
			.toArray();

		let dbUsername = '';
		let dbPassword = '';
		if (data != undefined || data != []) {
			dbUsername = data[0].username;
			dbPassword = data[0].password;
		}

		// Si se especifico un usuario y contraseña, proceda con la validación
		// de lo contrario, un mensaje de error es retornado
		if (username && password) {
			// Si los usuarios y las contraseñas coinciden, proceda con la generación del token
			// de lo contrario, un mensaje de error es retornado
			console.log('aaa', username === dbUsername && password === dbPassword);
			if (username === dbUsername && password === dbPassword) {
				// Se genera un nuevo token para el nombre de usuario el cuál expira en 24 horas
				let token = jwt.sign({ username: username }, config.secret, {
					expiresIn: '24h'
				});
				let t = {
					token: token,
					role: data[0].role
				};
				client
					.db('Users')
					.collection('tokens')
					.insertOne(t);

				// Retorna el token el cuál debe ser usado durante las siguientes solicitudes
				res.json({
					success: true,
					message: 'Authentication successful!',
					token: token
				});
			} else {
				// El error 403 corresponde a Forbidden (Prohibido) de acuerdo al estándar HTTP
				res.json({
					success: false,
					message: 'Incorrect username or password'
				});
			}
		} else {
			// El error 400 corresponde a Bad Request de acuerdo al estándar HTTP
			res.send(400).json({
				success: false,
				message: 'Authentication failed! Please check the request'
			});
		}
	}

	index(req, res) {
		// Retorna una respuesta exitosa con previa validación del token
		res.json({
			success: true,
			message: 'Index page'
		});
	}

	indexAdmin(req, res) {
		// Retorna una respuesta exitosa con previa validación del token
		res.json({
			success: true,
			message: 'this acction only only can be made by admin user'
		});
	}
}

module.exports = HandlerGenerator;
