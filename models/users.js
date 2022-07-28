const mongoose = require('mongoose')
const Item = require('./items')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    regNumber: {
        type: Number,
        required: [true, "registration number required"]
    },
    year: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: [true, "password required"]
    },
    selectedItem: [{
        itemId: String,
        itemName: String,
        itemPrice: Number,
        itemQnt: Number
    }]
});

const User = mongoose.model('User', userSchema);
module.exports = User;