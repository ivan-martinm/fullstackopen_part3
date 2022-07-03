const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

mongoose.connect(url)
    .then(result => {
        console.log('connected')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB: ', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, 'name must have at least 3 characters'],
        required: [true, 'name required']
    },
    number: {
        type: String,
        validate: {
            validator: v =>
            /^\d{2,3}-\d+$/g.test(v) || /^\d{8,}$/g.test(v),
            message: 'number not valid'
        },
        required: [true, 'number required']
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema, 'persons') // The 3rd parameter prevents mongoose from renaming model to 'people'