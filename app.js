const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connecting to mongoDB through mongoose
main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect("mongodb+srv://aayushBatra:Test123@cluster0.o5fdz8d.mongodb.net/todolistDB");
}

//creating models
const itemsSchema = new mongoose.Schema({
    name: String,
});
const Item = mongoose.model("Item", itemsSchema);

//creating array of default items
const item1 = new Item({
    name: "Welcome to DayToDayTasks!",
});
const item2 = new Item({
    name: "Hit the + button to add a new item.",
});
const item3 = new Item({
    name: "← Hit this to delete an item.",
});
const defaultItems = [item1, item2, item3];

app.get("/", async function (req, res) {

    //getting date
    let date = new Date();
    const options = { weekday: 'long',month: 'long', day: 'numeric' };
    let dateHeading = date.toLocaleDateString('en-US',options);
    //inserting default items in db and rendering all items to website from db
    Item.find({}, async function (err, foundItems) {
        if (foundItems.length === 0) {
            await Item.insertMany(defaultItems, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("default items added successfully");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: dateHeading,
                newListItems: foundItems,
            });
        }
    });
});

app.post("/", async function (req, res) {
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName,
    });
        await item.save();
        res.redirect("/");
    
});

app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;
        //deleting items from main route list
        await Item.deleteOne({ _id: checkedItemId });
        console.log("successfully deleted checked item.");
        res.redirect("/");
});


let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}


app.listen(port, function () {
    console.log("Server has started successfully.");
});
