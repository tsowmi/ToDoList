//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");

const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to todolist!"
});

const item2=new Item({
  name:"Hit the + button to add new item"
});

const item3=new Item({
  name:"<-- Hit this to delete an item"
});

const itemArray=[item1,item2,item3];
const listSchema={
  name: String,
  items: [itemsSchema]
};
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,FoundItems){
    console.log(FoundItems.length);
    if(FoundItems.length ===   0)
    {
      Item.insertMany(itemArray,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Inserted items");
        }
      });
      res.redirect("/");
    }
  else {
    console.log("in render else");
      res.render("list", {listTitle: "Today", newListItems: FoundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  console.log(itemName+" "+listName);

  const newItem = new Item({
    name:itemName
  });
  if(listName==="Today")
  {
    console.log("List name is Today");
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


});

app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkBox;
  const listName=req.body.listName;
  console.log(checkedItemId+" "+listName);
  if(listName==="Today"){
    console.log("In today delete Route");
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Deleted Item");
          res.redirect("/");
      }
    });
    //res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err, foundList){
      if(err){
        console.log(err);
      }else{
        console.log("Deleted Item");
        res.redirect("/"+listName);
  //res.redirect("/");
      }
    });
  }
  // Item.findByIdAndRemove(checkedItemId,function(err){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     console.log("Deleted Item");
  //   }
  // })
  // res.redirect("/"+listName);
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
 List.findOne({name:customListName},function(err,foundList){
   if(!err){
     if(!foundList){
       const list = new List({
         name: customListName,
         items: itemArray
       });
        list.save();
        res.redirect("/"+customListName);
   }else{
     res.render("list", {listTitle: customListName, newListItems: foundList.items});
   }
 }
}
 )


})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
