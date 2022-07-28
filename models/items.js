const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    itemType: {
        type: String,
    },
    itemName: { type: String },
    itemPrice: { type: Number },
});


const Item = mongoose.model('Item', itemSchema);

module.exports = Item;



// Item.insertMany([{
//         itemType: 'Veg',
//         itemName: 'Paneer Tikka',
//         itemPrice: 70
//     },
//     {
//         itemType: 'Veg',
//         itemName: 'Paneer Kadhai',
//         itemPrice: 70
//     },
//     {
//         itemType: 'Veg',
//         itemName: 'Noodle',
//         itemPrice: 55
//     }
// ])

// Item.insertMany([{
//         itemType: 'non-veg',
//         itemName: 'Chicken Noodle',
//         itemPrice: 55
//     },
//     {
//         itemType: 'non-veg',
//         itemName: 'Egg Bhurji',
//         itemPrice: 40
//     }

// ])