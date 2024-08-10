const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./src/models/person')
const app = express()

// Middlewares
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
morgan.token('body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id)
    .then(person => {
      res.json(person)
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndDelete(id)
    .then(result => {
      res.json(result)
    })
    .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const person = {
    name: req.body.name,
    number: req.body.number
  }

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then(updated => {
      res.json(updated)
    })
    .catch(err => next(err))

})

app.post('/api/persons', (req, res, next) => {
  const data = req.body

  if (!data.name || !data.number) {
    return res.status(400).json({
      error: 'content missing'
    })
  }
  //TODO: Check if person already exists

  const person = new Person({
    name: data.name,
    number: data.number
  })

  person.save()
    .then(saved => {
      res.json(saved)
    })
    .catch(err => next(err))
})

app.get('/info', (req, res) => {
  Person.countDocuments().then(count => {
    res.send(`
      <div>
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      </div>
    `)
  })

})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler) //MUST BE LAST MIDDLEWARE & AFTER ROUTES

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})