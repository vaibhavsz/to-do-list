// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-vaibhav:Test123@cluster0.u6rrw.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your to-do list"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "Check the box to delete"
});

const defaultitems = [item1, item2, item3];

const listsSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listsSchema);

const workItems = [];

app.get("/", function(req, res) {
  const day = date.getDate();
  Item.find({}, function(err, foundItems){
    if(foundItems.length == 0){
      Item.insertMany(defaultitems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items in db");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();
  const item = new Item({
    name:itemName
  });
console.log(listName);
  if(listName == day){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList){
      if(!err){
        if(!foundList){
          // create the new list
          console.log("doesn't exists");
          const list = new List({
            name: customListName,
            items: defaultitems
          });
          list.save();
          res.redirect("/"+ customListName);
        }
        else{
          // show the existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

        }
      }
    else{
      console.log(err);
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", function(req,res){
  const checkBoxId = req.body.checkbox;
  const listName = req.body.listName;
  const day =  date.getDate();

  if(listName == day){
    Item.findByIdAndRemove(checkBoxId, function(err){
      if(err){
        console.log(err);
      } else{
        console.log("Successfully deleted the list record");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkBoxId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
