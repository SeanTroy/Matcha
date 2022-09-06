module.exports = function (app, con) {

	let persons = [
		{
			"id": 1,
			"name": "Arto Hellas",
			"number": "040-123456"
		},
		{
			"id": 2,
			"name": "Ada Lovelace",
			"number": "39-44-5323523"
		},
		{
			"id": 3,
			"name": "Dan Abramov",
			"number": "12-43-234345"
		},
		{
			"id": 4,
			"name": "Mary Poppendieck",
			"number": "39-23-6423122"
		}
	]

	app.get('/info', (request, response) => {
		const personCount = persons.length
		const date = new Date()
		response.send(`<p>Phonebook has info for ${personCount} people</p><p>${date}</p>`)
	})

	app.get('/api/persons', (request, response) => {
		response.json(persons)
	})

	app.get('/api/persons/:id', (request, response) => {
		const id = Number(request.params.id)
		// console.log(id)
		const person = persons.find(person => {
			return person.id === id
		})
		// console.log(person)
		if (person) {
			response.json(person)
		} else {
			response.status(404).end() // end method responds to the request without sending any data
		}
	})

	app.delete('/api/persons/:id', (request, response) => {
		const id = Number(request.params.id)
		persons = persons.filter(person => person.id !== id)

		response.status(204).end()
	})

	app.post('/api/persons', (request, response) => {
		const body = request.body

		if (!body.name || !body.number) {
			return response.status(400).json({
				error: 'name or number missing'
			})
		}

		if (persons.find(person => person.name === body.name)) {
			return response.status(400).json({
				error: 'name must be unique'
			})
		}

		const person = {
			id: Math.floor(Math.random() * 999),
			name: body.name,
			number: body.number
		}

		var sql = "INSERT INTO sample (id, name) VALUES (?,?)";
		con.query(sql, [1, body.name], function (err, result) {
			if (err) throw err;
			console.log("Result: " + result);
		});

		persons = persons.concat(person)
		response.json(person)
	})
}