const express = require('express'); 
const app = express();
const mysql = require('mysql');

var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');


var cart_qty =0;
var total = 0;

app.engine('html', require('ejs').renderFile);//render other files
app.use(express.static("public"));//access img css js or any external file
app.use(express.static('css'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'Secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


if (process.env.JAWSDB_URL) {
	var connection = mysql.createConnection(process.env.JAWSDB_URL)
} else {
	/* Configure LOCAL MySQL DBMS */
	var connection = mysql.createConnection({
    		host: 'localhost',
    		user: 'yvcruz',
    		password: 'yvcruz',
    		database: 'books_db'
	});
	connection.connect();
} 

// ROUTES ---can also be POST method vs get
app.get("/", function(req,res) //root route
{
    var stmt = "select bookId, cover, title, author, year, price from book_info;";
    
    var bookExists = null;
    
    connection.query(stmt, function(error, found){
        if (error) throw error;
        if (found.length){ bookExists = found; }
        res.render("index.ejs", {bookInfo:bookExists});
    });
});

app.get("/book/:id", function(req, res) { // displays product details
    var stmt = "select * from book_info where bookId=" + req.params.id + ";";

    var bookExists = null;
    
    connection.query(stmt, function(error, found){
        if (error) throw error;
        if (found.length){ bookExists = found; }
        res.render("productDetail.ejs", {bookInfo:bookExists})
    });
});

app.get("/:num/:gen", function(req, res) { // displays books based on genre
    var stmt = "select * from book_info where genre='" + req.params.gen + "';";

    var bookExists = null;
    
    connection.query(stmt, function(error, found){
        if (error) throw error;
        if (found.length){ bookExists = found; }
        res.render("genreDisplay.ejs", {bookInfo:bookExists})
    });
});

app.get("/contact", function(req, res){ // contact route
    res.render("contact.ejs");
});

app.post("/addcart/:bkid", login_check,function(req, res){
    var name = req.session.login
    var st = 'select userId from user_info where userName=\''
            +name+'\'';
    var uid;        
    connection.query(st, function(error, found) {
        console.log(found);
        if (error) throw error;
        uid = found[0].userId;
        console.log(uid+"<--uid");
    });        
    
    var stmt = 'select * from order_info where userId=\''
                +uid+'\' and bookId=\''
                +req.body.bookitem+'\'';
    console.log(stmt)            
    connection.query(stmt, function(error, found) {
        if (error) throw error;
        if (found.length) {
            var quant_update = found[0].quantity+1;
            var update_entry = 'update order_info set quantity='
                                +quant_update+' where userId=\''
                                +uid+'\' and bookId=\''
                                +req.body.bookitem+'\'';
            console.log(update_entry);
            connection.query(update_entry, function(error, found) {
                if (error) { throw error}
                else res.render('successAdd.ejs', {success: true});
                
            });
        }else {
            var new_entry = 'insert into order_info (userId, bookId, quantity) values ('
                            +uid+', \''
                            +req.body.bookitem+'\', \''
                            +1+'\')';
            console.log(new_entry);
            connection.query(new_entry, function(error, result) {
                if (error) { throw error }
                //else res.render('successAdd.ejs', {success: true});
            });
            
        }
    });
    
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
            res.render('login.ejs', {signUpError: true});
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


app.get("/signup", function(req, res){ // login route
    res.render("signUp.ejs", {signUpError: false, dontMatch : false});
});
app.post("/signup", function(req, res){ // sign up route
    var user = req.body.newUsername;
    var password = req.body.newPassword;
    var confirmPass = req.body.confirmPassword;
    
    if (password == confirmPass) {
        var stmt = 'select * from user_info where userName=\''
                +user+'\' '+ 
                'and password=\'' + 
                password+'\'';
        connection.query(stmt, function(error, results){
        if (error) throw error;
        if(!results.length){      //user is not in db
            var random = Math.floor(Math.random() * 100);
            var sql_data = 'insert into user_info values ('
                            +'\''+random+'\', '
                            +'\''+user+'\', '
                            +'\''+password+'\')';
            connection.query(sql_data, function(error, result) {
                req.session.login = user;
                if(error) {
                    req.session.destroy();
                    throw error;
                }    
                res.redirect('/');
            });                
        }else {     
            console.log("User Already Exists!");
            res.render('signUp.ejs', {signUpError: true, dontMatch : false});
        }
        });        
    }
    else {
        res.render('signUp.ejs', {signUpError : false, dontMatch : true});
    }
});
    
app.get('/profile', function(req, res){
  if(req.session.login != null){
    var name = req.session.login;
    res.render("profile.ejs", {loggedIn: true, userName: name, loggedError: false});
  }else res.render("profile.ejs",{loggedError: true, loggedIn: false});
});

  /*  var username = app.get("#newUsername");
    var password = app.get("#newPassword");
    var confirmpass = app.get("#confirmPassowrd");
    
    if(password != confirmpass){
        app.get("errorMsgnew").innerHtml = `<p id = "errorMsgnew">Passwords don't match! Try again.</p>`;
    }else{
        var user = mysql.Server();// Need to access DB to get List of all users.
        if(user == null){
            //add user info to DB
        }
    }*/
    



app.get("/search", function(req,res) //search route
{
    var stmt = "select cover, title, author, year, price from book_info;";
    
    var bookExists = null;
    
    connection.query(stmt, function(error, found){
        if (error) throw error;
        if (found.length){ bookExists = found; }
        res.render("search.ejs", {bookInfo:bookExists});
    });

});



app.get('/checkout',login_check,function(req, res){
    var name = req.session.login
    var st = 'select userId from user_info where userName=\''
            +name+'\'';
    var uid;        
    connection.query(st, function(error, found) {
        console.log(found);
        if (error) throw error;
        uid = found[0].userId;
        console.log(uid+"<--uid");
    });  
    
    var stmt = 'select cover, title, quantity, price from order_info left join book_info '+
               'on order_info.bookId=book_info.bookId ' + 
               'where userId=\'' + 1 + '\'';
               console.log(stmt);
    connection.query(stmt, function(error, results){
        if(error){
            throw error;
        } else if(results.length){ 
            console.log(results);
            res.render('checkoutCart.ejs', {result: true, books: results});     
        } else {                        
            console.log("No books in cart");
            res.render('checkoutCart.ejs', {result: false});
        }
    });
});

function login_check(req, res, next) {
  //  if the user isn't logged in, redirect them to a login page
  if(!req.session.login) {
    res.redirect("/login");
    return; 
  }
  //  the user is logged in, so call next()
  next();
}

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