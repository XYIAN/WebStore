const express = require('express'); 
const app = express();
const mysql = require('mysql');

app.engine('html', require('ejs').renderFile);//render other files
app.use(express.static("public"));//access img css js or any external file
app.use(express.static('css'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'jennifer',
    password: 'jenniferL',
    database: 'books_db'
});
connection.connect();

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

app.get("/main", function(req, res){ // main route
    // res.render("mainPage.ejs");
    var everything = "select * from book_info;";
    
    var bookInfo = [];
    var bookExists = null;
    
    connection.query(everything, function(error, found){
       if (error) throw error;
       if (found.length){
           found.forEach(function(b){
               
           })
       }
    });
    
});

// cover - image to display
// title - book title
// author - name of author
// year - year published?
// price - $ + price



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