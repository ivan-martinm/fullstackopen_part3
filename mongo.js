const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Missing password as an argument: node mongo.js <password> <PersonName> <PersonNumber>')
  process.exit(1)
}
else if (process.argv.length > 3 && process.argv.length < 5) {
  console.log('Please provide all person information as arguments: node mongo.js <password> <PersonName> <PersonNumber>')
  process.exit(1)
}

const password = process.argv[2]
const database = 'phonebookApp'
const url = `mongodb+srv://ivanmartin:${password}@fullstackopen.9mmup.mongodb.net/${database}?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema, 'persons') // The 3rd parameter prevents mongoose from renaming model to 'people'

mongoose
  .connect(url)
  .then(() => {
    if (process.argv.length === 3) {
      console.log('phonebook:')
      return Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person.name, person.number)
        })
      })
    } else {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
      })
      return person.save()
    }
  })
  .then(() => {
    if (process.argv.length > 3) {
      console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
    }
    mongoose.connection.close()
  })
  .catch((err) => console.log(err))