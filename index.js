const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./modules/person')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))


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

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => response.json(persons))
})

app.get('/info', (request, response) => {
    Person.countDocuments({})
        .then(count =>
            response.send(
                `<p>Phonebook has info for ${count} people</p>
                <p>${Date()}</p>`
            )
        )
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => response.json(person))
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            if (!result) { // If the person was already removed, result will be null
                const error = { 
                    name: 'AlreadyRemoved',
                    message: 'person already removed from server'
                }
                return next(error)
            } else {
                response.status(204).end()
            }
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
    .then(savedPerson =>
        response.json(savedPerson)
    )
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(request.params.id, {name, number }, 
        { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson =>
            response.json(updatedPerson))
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.name, error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
    else if (error.name === 'AlreadyRemoved') { // 
        return response.status(404).send({ error: error.message })
        // I am not sure if using 404 is correct here
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
)
