const express = require('express'); 
const app = express();
const mysql = require('mysql');

var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');

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
    		user: 'kyle',
    		password: 'kyle',
    		database: 'books_db'
	});
	connection.connect();
} 
function search (req, res){ //function to allow search of keywork/term, genre or both 
    var searchTerm = req.query.search; 
    var genre = req.query.genre; 
        let query = 'SELECT * FROM book_info'; 
        if(searchTerm != '' && genre != ''){
            query = 'SELECT * FROM book_info WHERE Genre = ' + genre + `' AND ( Name LIKE '%` + searchTerm + `%')`;
        }
        else if(searchTerm != '' && genre == ''){
            query = `SELECT * FROM book_info WHERE Name LIKE '%` + searchTerm + `%'`;
        }
        else if(searchTerm != '' && genre == ''){
            query = `SELECT * FROM book_info WHERE Genre LIKE '` + genre + `'`;
        }
        connection.query(query, (err, result) => {
            if(err){
                req.searchResult = ""; 
                req.searchTerm = ""; 
                req.genre = ""; 
                //next(); 
            }
            req.searchResult = result; 
            req.searchTerm = searchTerm; 
            req.genre = ""; 
            
           // next(); 
        });
        
        
}//END SEARCH FUNCTION

// ROUTES ---can also be POST method vs get
app.get("/", function(req,res) //root route
{
    //search(req,res);
    var stmt = "select bookId, cover, title, author, year, price from book_info;";
    var searchTerm = req.query.search; 
    var searchResult = req.query.searchResult; 
    var bookExists = null;
    
    connection.query(stmt, function(error, found){
        if (error) throw error;
        if (found.length){ 
            bookExists = found,
            req.searchTerm = searchTerm,
            req.searchResult = found; 
            
        }
        res.render("index.ejs", {bookInfo:bookExists}, searchTerm, searchResult );
    });
});

app.get("/book/:id", function(req, res) { // displays product details
    var stmt = "select * from book_info where bookId=" + req.params.id + ";";

    var bookExists = null;
    
    connection.query(stmt, function(error, found){
        if (error) throw error;
        if (found.length){
            bookExists = found; }
        res.render("productDetail.ejs", {bookInfo:bookExists})
    });
});

app.get("/genre/:genre", function(req, res) { // displays books based on genre
    var stmt = "select * from book_info where genre='" + req.params.genre + "';";

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

app.get("/about", function(req, res){ // about route
    res.render("about.ejs");
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
    var user = req.body.newUsername;
    var password = req.body.newPassword;

    var stmt = 'select * from user_info where userName=\''
                + req.body.user+'\' '+ 
                'and passport=\'' + 
                req.body.password+'\'';
    var new_user = null;
    var new_password = null;
    connection.query(stmt, function(error, results){
    if(results == null){      //user is in db
        new_user = user;
        new_password = password;
        req.session.signUp = user;
        var random = Math.floor(Math.random() * 100);
        
        var sql_data = 'insert * into user_info where userName\''
                        + req.body.new_user +'\' '
                        + 'and password=\'' + 
                        req.body.new_password+'\''
                        + 'and userId=\'' + 
                        req.body.random+'\'';
                        
        res.redirect('/');        
        }else {                        //user is not in db - do this as a pop up later
          console.log("User Already Exists! Info");
          res.render('signUp.ejs', {loginError: true});
        }
    });
    
});

app.get("/search", search, (req, res) =>{
    var searchResult = req.searchResult; 
    res.render('search.ejs', {
        results: searchResult.length, 
        searchTerm: req.searchTerm, 
        searchResult: searchResult, 
        genre: req.genre
    });
});

app.get('/checkout',login_check,function(req, res){
    var stmt = 'select title, quantity, price from order_info left join book_info '+
               'on order_info.bookId=book_info.bookId ' + 
               'where userId=\'' + req.session.login + '\'';
    connection.query(stmt, function(error, results){
        if(error){
            throw error;
        } else if(results.length){ 
            res.render('checkoutCart.ejs', {results: true, books: results});     
        } else {                        
            console.log("No books in cart");
            res.render('checkoutCart.ejs', {results: false});
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
