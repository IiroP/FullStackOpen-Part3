const mongoose = require('mongoose')

// Get password from command line arguments
if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}
const password = process.argv[2]

// Connect to MongoDB
const url =
  `mongodb+srv://fullstack:${password}@fullstackopen.dyqmv.mongodb.net/?retryWrites=true&w=majority&appName=FullStackOpen`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

const addPerson = (name, number) => {
  const person = new Person({
    name,
    number,
  })
  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

const listPeople = () => {
  console.log('phonebook:')
  Person.find({}).then(res => {
    res.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

// Actual program
if (process.argv.length === 3) {
  listPeople()
} else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]
  addPerson(name, number)
} else {
  console.error('Invalid number of arguments')
  mongoose.connection.close()
}