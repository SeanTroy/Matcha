module.exports = function (app, pool, bcrypt, transporter) {
	app.post('/api/signup/checkuser', (request, response) => {
		const body = request.body

		console.log("Username: " + body.username)
		if (body.username.length < 4 || body.username.length > 25)
			return response.send("Username has to be between 4 and 25 characters.")
		if (!body.username.match(/^[a-z0-9]+$/i))
			return response.send("Username should only include characters (a-z or A-Z) and numbers (0-9).")
		if (!body.firstname.match(/^[a-zåäö]+$/i) || !body.lastname.match(/^[a-zåäö]+$/i))
			return response.send("First name and last name can only include characters a-z and å, ä, ö.")
		if (!body.email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))
			return response.send("Please enter a valid e-mail address.")
		if (!body.password.match(/(?=^.{8,30}$)(?=.*\d)(?=.*[!.@#$%^&*]+)(?=.*[A-Z])(?=.*[a-z]).*$/)) {
			return response.send("PLEASE ENTER A PASSWORD WITH: </p><p> - a length between 8 and 30 characters </p><p> - at least one lowercase character (a-z) </p><p> - at least one uppercase character (A-Z) </p><p> - at least one numeric character (0-9) <br> at least one special character (!.@#$%^&*)")
		}
		if (body.password !== body.confirmPassword)
			return response.send("The entered passwords are not the same!")

		const checkUsername = async () => {
			var sql = "SELECT * FROM users WHERE username = $1";
			const { rows } = await pool.query(sql, [body.username])
			if (rows.length) {
				throw ("Username already exists!")
			} else
				return
		}

		const checkEmail = async () => {
			var sql = "SELECT * FROM users WHERE email = $1";
			const { rows } = await pool.query(sql, [body.email])
			if (rows.length) {
				throw ("User with this e-mail already exists!")
			} else
				return
		}

		checkUsername()
			.then(() => checkEmail())
			.then(() => {
				console.log("User details checked!")
				response.send(true)
			}).catch((error) => {
				response.send(error)
			})
	})

	app.post('/api/signup', (request, response) => {
		const { username, firstname, lastname, email, password } = request.body
		console.log("Signup username: " + username)

		const saveHashedUser = async () => {
			const hash = await bcrypt.hash(password, 10);
			console.log("Hashed password: " + hash)
			try {
				var sql = "INSERT INTO users (username, firstname, lastname, email, password) VALUES ($1,$2,$3,$4,$5) RETURNING *";
				await pool.query(sql, [username, firstname, lastname, email, hash])
				return
			} catch (error) {
				console.log("ERROR :", error)
				throw (error)
			}
		}

		const createVerifyCode = async () => {

			const getUserId = async () => {
				var sql = "SELECT id FROM users WHERE username = $1";
				const { rows } = await pool.query(sql, [username])
				console.log("Id SQL result: " + rows[0]['id']);
				return (rows[0]['id'])
			}

			var code = await Math.floor(Math.random() * (900000) + 100000)

			getUserId()
				.then(user_id => {
					var sql = "INSERT INTO email_verify (user_id, email, verify_code) VALUES ($1,$2,$3)";
					pool.query(sql, [user_id, email, code])
					console.log("Email verify created!");
				}).catch(error => {
					console.log(error)
				})

			return (code)
		}

		const sendConfirmationMail = (useremail, code) => {

			var mailOptions = {
				from: process.env.EMAIL_ADDRESS,
				to: useremail,
				subject: 'Matcha account confirmation',
				html: `<h1>Welcome</h1><p>You have just signed up for Matcha, well done!</p>
						<p>To fully access the world of Matcha and find the one that was meant for you,
						you just need to confirm your account with a single click. Yes, it's that easy!</p>
						<a href="http://localhost:3000/confirm/${username}/${code}">Click here to start finding perfect Matches!</a>
						<p>Love, Matcha Mail</p>`
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
		}

		saveHashedUser().then(() => createVerifyCode())
			.then((code) => sendConfirmationMail(email, code))
			.then(() => {
				response.send("New user created!")
			}).catch((error) => {
				response.send(error)
			})
	})

	app.post('/api/signup/verifyuser', (request, response) => {
		const { username, code } = request.body

		const checkCode = async () => {
			var sql = `SELECT * FROM email_verify
						INNER JOIN users ON email_verify.user_id = users.id
						WHERE email_verify.verify_code = $1`;
			const { rows } = await pool.query(sql, [code])
			if (rows.length === 0) {
				throw ("No code found!")
			} else {
				return ("Code matches!")
			}
		}

		const setAccountVerified = () => {
			var sql = `UPDATE users SET verified = 'YES' WHERE username = $1`;
			pool.query(sql, [username])

			var sql = `DELETE FROM email_verify WHERE verify_code = $1`;
			pool.query(sql, [code])
		}

		checkCode().then(() => {
			setAccountVerified()
			console.log("User code verified!")
			response.send(true)
		}).catch((error) => {
			response.send(error)
		})
	})
}
