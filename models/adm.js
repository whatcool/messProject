const mongoose = require('mongoose')
const adminSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true
    }
})

const Adm = mongoose.model('Adm', adminSchema);
module.exports = Adm;