const express = require('express'); 
const app = express();
const mysql = require('mysql');
var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');
// const path = require('path')
app.engine('html', require('ejs').renderFile);//render other files
app.use(express.static("public"));//access img css js or any external file
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'Secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


/* Configure MySQL DBMS */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'yvcruz',
    password: 'yvcruz',
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
    res.render("login.ejs", {loginError: false});
});

app.post('/login', function(req, res){
    var stmt = 'select * from user_info where userName=\'' 
                +req.body.un+'\' '+
                'and password=\''+
                req.body.pw+'\'';
    var user = null;
    connection.query(stmt, function(error, results){
        if(results.length){      //user is in db
            user = results[0].userName;
            req.session.login = user;
            res.redirect('/');        
        }else {                        //user is not in db - do this as a pop up later
            console.log("Incorrect Login Info");
            res.render('login.ejs', {loginError: true});
        }
    });
});

/* Logout Route */
app.get('/logout', function(req, res){
    if (req.session.login != null) {
        var name = req.session.login;     
        req.session.destroy();
        res.render("logout.ejs", {logoutUser: name});
    }else res.render("logout.ejs",{logoutUser: "ERROR NO LOG IN"})    
});

app.get("/signUp", function(req, res){ // sign up route
    res.render("signUp.ejs");
});

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