const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('personDataToken', (request) =>
    request.method === 'POST'
        ? JSON.stringify(
            {
                name: request.body.name,
                number: request.body.number
            }
        )
        : ' '
)

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personDataToken'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    }, {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    }, {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    }, {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${Date()}</p>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.statusMessage = "Person not found"
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const person = request.body

    if (!person.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    }
    if (!person.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }
    if (persons.find(p => p.name === person.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const randomId = Math.floor((Math.random() * 100)) + 5 // I do not want numbers lesser than 5 since the hardcoded array already contains those
    person.id = randomId

    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
