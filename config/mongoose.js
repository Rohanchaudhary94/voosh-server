const mongoose=require('mongoose');
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://rohanraj:rohanraj94@cluster0.te4tlpi.mongodb.net/vooshdata?retryWrites=true&w=majority");
const db=mongoose.connection;

db.on('error',console.error.bind(console,"Error is conecting to MongoDB"));

db.once('open',function(){
    console.log('Connected to Database :: MongoDB');
});

module.exports=db;