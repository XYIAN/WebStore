const express = require('express'); 
const app = express();
const mysql = require('mysql');
// const path = require('path')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'raul6767',
    password: 'raulP676',
    database: 'book_db'
});
connection.connect();

app.engine('html', require('ejs').renderFile);//render other files
app.use(express.static("public"));//access img css js or any external file

//routes ---can also be POST method vs get
app.get("/", function(req,res)//root route
{
   res.render("index.ejs");//HOME PAGE
   //res.send("it works!"); 
});

app.get("/login", function(req, res){ // login route
    res.render("login.ejs");
});

app.get("/signUp", function(req, res){ // sign up route
    res.render("signUp.ejs");
    
    
});
/*
app.listen("click", function(){
    app.get("#newUserButton");
    
    var username = app.get("#newUsername");
    var password = app.get("#newPassword");
    var confirmpass = app.get("#confirmPassowrd");
    
    if(password != confirmpass){
        app.get("errorMsgnew").innerHtml = `<p id = "errorMsgnew">Passwords don't match! Try again.</p>`;
    }else{
        var user = mysql.Server();// Need to access DB to get List of all users.
        if(user == NULL){
            //add user info to DB
        }
    }
    
});
*/

app.get("/main", function(req, res){ // main route
    res.render("mainPage.ejs");
});



//server listener - run server w/ port number
//8081(have to include in url) , "0, 0 , 0 , 0" -used for php type
app.listen(process.env.PORT, process.env.IP , function()//using local host port 8080 127
{
   var loopNum = 4; 
    
    for(let i = 0 ; i < loopNum ; i++)
    {
       console.log("Opening with KEY::ID" + (i*34) + " ACCESS");
       console.log("Opening with KEY::ID" + (i*346)+ 0 + " accessACCESS");
    }
    console.log("Welcome , currently retreiving IP ::::");
    console.log("Express Server is now Running...");
});

//end basic express code


















//copy pasters :::

// const express = require('express'); 
// const app = express(); 
// //routes ---can also be POST method vs get
// app.get("/", function(req,res)
// {
//   res.send("it works!"); 
// });

// //server listener 
// app.listen("8081" , "0.0.0.0" , function()//using local host
// {
//     console.log("Express Server is Running...");
// });
// //end basic express code