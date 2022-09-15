require('dotenv').config() // to use .env variables
const express = require('express')
const app = express()
app.use(express.json()) // needed to attach JSON data to POST body property
var morgan = require('morgan') // middleware to log requests
var nodemailer = require('nodemailer'); // middleware to send e-mails
const cors = require('cors') // Cross-origin resource sharing (CORS) middleware is required to allow requests from other origins
const bcrypt = require("bcrypt") // For password hashing and comparing
const session = require('express-session'); // for session management
app.use(cors())
app.use(express.static('build')) // express checks if the 'build' directory contains the requested file
app.use(session({ secret: 'matchac2r2p6', saveUninitialized: true, resave: true }));

morgan.token('body', request => {
	return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const { Pool } = require('pg')
const pool = new Pool({
	user: 'matcha',
	host: 'postgres-db',
	database: 'matcha',
	password: 'root',
	port: 5432,
})
pool.connect()

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	}
});

var sess;

require('./routes/signup.js')(app, pool, bcrypt, transporter);

app.post('/api/login', (request, response) => {
	const { username, password } = request.body

	const verifyUser = async () => {
		var sql = "SELECT * FROM users WHERE username = $1 AND verified = 'YES'";
		const { rows } = await pool.query(sql, [username])
		if (rows.length === 0) {
			console.log("User not found!")
			throw ("User not found!")
		} else {
			const compareResult = await bcrypt.compare(password, rows[0]['password'])
			if (compareResult) {
				sess = request.session
				sess.userid = rows[0]['id']
				sess.username = rows[0]['username']
				return (sess)
			} else
				throw ("Wrong password!")
		}
	}

	verifyUser()
		.then((sess) => {
			response.send(sess)
		}).catch(error => {
			response.send(error)
		})

})

app.get('/api/login', (request, response) => {
	sess = request.session;
	if (sess.username) {
		response.send(sess.username);
	}
	else {
		response.send('');
	}
});

app.get('/api/logout', (request, response) => {
	request.session.destroy((err) => {
		if (err) {
			return console.log(err);
		}
		// console.log(sess)
		response.end();
	});

});

app.post('/api/resetpassword', (request, response) => {
	const { resetvalue } = request.body

	const findUserAccount = async () => {
		var sql = "SELECT * FROM users WHERE username = $1 OR email = $1";
		const { rows } = await pool.query(sql, [resetvalue])
		console.log(rows)
		if (rows.length === 0) {
			throw ("User not found!")
		} else {
			return (rows)
		}
	}

	const createResetCode = async (rows) => {
		console.log("CREATING CODE!")
		var code = await Math.floor(Math.random() * (900000) + 100000)
		// const hashedCode = await bcrypt.hash(toString(code), 10)

		try {
			var sql = `INSERT INTO password_reset (user_id, reset_code, expire_time)
						VALUES ($1,$2,(CURRENT_TIMESTAMP + interval '30 minutes')) RETURNING *`;
			await pool.query(sql, [rows[0]['id'], code])
			const mailInfo = { username: rows[0]['username'], email: rows[0]['email'], code: code }
			return (mailInfo)
		} catch (error) {
			throw (error)
		}
	}

	const sendResetMail = async (mailInfo) => {
		console.log("SENDING EMAIL!")

		var mailOptions = {
			from: process.env.EMAIL_ADDRESS,
			to: mailInfo.email,
			subject: 'Matcha password reset',
			html: `<h1>Hello!</h1><p>It seems like you have forgotten your password!</p>
					<p>Never mind, who remembers those anyway. And it's very easy to reset
					with a single click!</p>
					<a href="http://localhost:3000/resetpassword/${mailInfo.username}/${mailInfo.code}">Just click here to create a new password!</a>
					<p>Love, Matcha Mail</p>`
		};

		await transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});

		return
	}

	findUserAccount()
		.then(rows => createResetCode(rows))
		.then(mailInfo => sendResetMail(mailInfo))
		.then(() => response.send(true))
		.catch(error => response.send(error))
});

app.post('/api/setnewpassword', async (request, response) => {
	const { user, code, password, confirmPassword } = request.body

	if (password !== confirmPassword) {
		return response.send("The entered passwords are not the same!")
	}
	else if (!password.match(/(?=^.{8,30}$)(?=.*\d)(?=.*[!.@#$%^&*]+)(?=.*[A-Z])(?=.*[a-z]).*$/)) {
		return response.send("PLEASE ENTER A PASSWORD WITH: </p><p> - a length between 8 and 30 characters </p><p> - at least one lowercase character (a-z) </p><p> - at least one uppercase character (A-Z) </p><p> - at least one numeric character (0-9) <br> at least one special character (!.@#$%^&*)")
	}
	else {
		var sql = `SELECT * FROM password_reset
					INNER JOIN users ON password_reset.user_id = users.id
					WHERE users.username = $1 AND password_reset.reset_code = $2`
		const { rows } = await pool.query(sql, [user, code])
		if (rows.length === 0) {
			response.send("Password reset code not found!")
		} else {
			const hash = await bcrypt.hash(password, 10);
			var sql = "UPDATE users SET password = $1 WHERE username = $2"
			await pool.query(sql, [hash, user])
			var sql = "DELETE FROM password_reset WHERE user_id = $1"
			await pool.query(sql, [rows[0]['id']])
			response.send(true)
		}
	}
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
