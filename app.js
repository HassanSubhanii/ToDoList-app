//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");

const mongoose = require("mongoose");

const app = express();
const PORT=process.env.PORT;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));




 mongoose.connect("mongodb+srv://@cluster0.xtymweo.mongodb.net/todolistDB",{
   useNewUrlParser:true,
   useUnifiedTopology:true
 });

const workItems = [];
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Baking"
})
const item2 = new Item({
  name: "Cooking"
})
const item3 = new Item({
  name: "Eating"
});
let defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function() {
        console.log("Successfully Saved");

      }).catch(function(err) {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

    console.log(foundItems);

  }).catch(function(err) {
    console.log(err);
  });


});
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);


  List.findOne({
    name: customListName
  }).then(function(foundList) {
    if (!foundList) {


      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {

      res.render("list", {
        listTitle: foundList.name,

        newListItems: foundList.items

      });
    }

  }).catch(function(err) {
    console.log(err);
  });


});
// Item.insertMany(defaultItems).then(function() {
//   console.log("Successfully Saved");
//
// }).catch(function(err) {
//   console.log(err);
// }

//
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }).then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }


});
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function() {
      console.log("Item delted Successfully");
    }).catch(function(err) {
      console.log(err);
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    });
  }

});




app.listen(PORT, function() {
  console.log("Server has started");
});
