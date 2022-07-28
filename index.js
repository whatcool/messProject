const express = require('express')
const app = express();
const path = require('path')
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const User = require('./models/users');
const Item = require('./models/items')
const Adm = require('./models/adm')
const bcrypt = require('bcrypt');
const { findOne } = require('./models/users');
const session = require('express-session');


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride("_method"))
app.use(session({ secret: 'aitmess', resave: false, saveUninitialized: false }))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://localhost:27017/aitMess', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection Open")
    })
    .catch(error => {
        console.log("Error occured while connecting with Mongoose!!")
        console.log(error);
    })

// students year array
const years = [1, 2, 3, 4]

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        res.render('sessionFailed')
    } else {
        next();
    }
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// THIS IS FOR ADMIN
// app.get("/allitems", async(req, res) => {
//     const allitems = await Item.find({})
//     res.render('allitems', { allitems })
// })

// app.get("/createAdmin", (req, res) => {
//     res.render('createAdmin')
// })

// app.post("/createAdmin", async(req, res) => {
//     const password = req.body.password
//     console.log(password)
//     const hash = await bcrypt.hash(password, 12)
//     const newAdmin = new Adm({
//         password: hash
//     })
//     await newAdmin.save();
//     res.send('passsword done')
// })

app.get("/admin", async(req, res) => {

    res.render('adminLogin')
})

app.post("/admin", async(req, res) => {
    const password = req.body.password;
    const admUser = await Adm.findById({ _id: "62dc2b3425ccd0cb000b3b72" })
    const verified = await bcrypt.compare(password, admUser.password)
        // const allItems = await Item.find({});

    if (verified) {
        req.session.user_id = admUser._id;
        res.redirect('/admin/allItems')
    } else {
        //how to display alert message on the top of the page??????????????
        res.send('incorrect details')
            // res.redirect('/admin')
    }
})

app.get("/admin/allItems", requireLogin, async(req, res) => {
    const allItems = await Item.find({})
    res.render('adminAllItems', { allItems })
})

app.get("/:itemId/editItem", requireLogin, async(req, res) => {
    const { itemId } = req.params;
    // console.log(itemId);
    const item = await Item.findById({ _id: itemId })
        // console.log(item);
    res.render('editItem', { item })
})

app.get("/:itemId/deleteItem", requireLogin, async(req, res) => {
    const { itemId } = req.params;
    await Item.findOneAndDelete({ _id: itemId })
    const allItems = Item.find({})
    res.redirect('/admin/allItems')
})

app.get("/admin/addVeg", requireLogin, (req, res) => {
    res.render('addVeg')
})

app.get("/admin/addNon-veg", (req, res) => {
    res.render('addNon-veg')
})

app.post("/:itemId/editItem", async(req, res) => {
    const { itemId } = req.params
    const { itemType, itemName, itemPrice } = req.body;
    const item = await Item.findById({ _id: itemId })
    item.itemType = itemType
    item.itemName = itemName
    item.itemPrice = itemPrice
    await item.save()
    res.redirect('/admin/allItems')
})

app.post("/admin/addVeg", async(req, res) => {
    const { itemName, itemPrice } = req.body;
    const newItem = new Item({
        itemType: 'Veg',
        itemName: itemName,
        itemPrice: itemPrice
    })
    await newItem.save()
    res.redirect('/admin/allItems')
})

app.post("/admin/addNon-veg", async(req, res) => {
    const { itemName, itemPrice } = req.body;
    const newItem = new Item({
        itemType: 'non-veg',
        itemName: itemName,
        itemPrice: itemPrice
    })
    await newItem.save()
    res.redirect('/admin/allItems')
})

// THIS IS FOR ADMIN END
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Home Page
app.get("/", (req, res) => {
    res.render('homepage')
})

// To register new student
app.get("/register", (req, res) => {
    res.render('register', { years })
})

// To login
app.get("/login", (req, res) => {
    res.render('login')
})

// Show all items available in the mess
app.get("/:id/allitems", requireLogin, async(req, res) => {
    const userId = req.params.id;

    const user = await User.findById({ _id: userId })
    const allItems = await Item.find({});

    res.render('allitems', { userId, allItems, user })
})

// To show specific item details
app.get("/:id/:itemId", async(req, res) => {
    // res.send(req.params)
    const userId = req.params.id;
    const itemId = req.params.itemId;
    const user = await User.findOne({ _id: userId })
    const item = await Item.findOne({ _id: itemId })
    res.render('show', { itemId, item, user })
})

// To register new student
app.put("/", async(req, res) => {
    const { name, regNumber, year, password } = req.body;
    const hash = await bcrypt.hash(password, 12)
    const user = new User({
        name: name,
        regNumber: regNumber,
        year: year,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect(`/${user._id}/allitems`)
})

// To login
app.post("/", async(req, res) => {
    const { regNumber, password } = req.body;
    // console.log(password)
    const user = await User.findOne({ regNumber: regNumber })
    if (user === null) {
        res.render("loginFailed");
    } else {
        const verifiedUser = await bcrypt.compare(password, user.password);
        if (verifiedUser) {
            req.session.user_id = user._id;
            res.redirect(`/${user._id}/allitems`)
        } else {
            res.render('loginFailed') // Change krna hai
        }
    }
})

// To show specific item details and to add selected items form the page to the plate
app.post("/:id/:itemId", async(req, res) => {
    const userId = req.params.id;
    const iid = req.params.itemId;
    const quantity = req.body.itemQnt;

    const user = await User.findById({ _id: userId });
    const item = await Item.findOne({ _id: iid });

    user.selectedItem.push({
        itemId: iid,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQnt: quantity
    })
    user.save();

    res.redirect(`/${userId}/allitems`)
})

// To logout
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/")
})

app.post("/admin/logout", (req, res) => {
    res.redirect("/")
})

app.listen(5000, () => {
    console.log("server Started");
});