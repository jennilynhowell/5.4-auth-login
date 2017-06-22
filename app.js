const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');

const app = express();

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

//Users
const USERS = [
  {username: 'dan', password: 'cinnamonrolls', name: 'Dan'},
  {username: 'joel', password: 'tinhat', name: 'Joel'},
  {username: 'jennilyn', password: 'puppies', name: 'Jennilyn'}
];


//========================================== middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

//register session
app.use(session({
  secret: 'unicorn cats',
  resave: false,
  saveUninitialized: true
}));

//require user to be logged in
app.use(function(req, res, next){
  //get pathname and store in a var
  let pathname = parseurl(req).pathname;

  //if user is not logged in redir to the login page
  if(!req.session.user && pathname != '/login'){
    res.redirect('/login');
  } else {
    next();
  }
});

//count how many times you visited home page
app.use(function(req, res, next){
  //look at views object and assign it to views variable
  let views = req.session.views;
  if(!views){
    views = req.session.views = {};
  }

  //create a counter for page hits
  let pathname = parseurl(req).pathname;
  views.pathname = (views.pathname || 0) + 1;
  next();
});

//========================================== requests
//here are my two pages
app.get('/login', function(req, res){
  res.render('login', {});
});

app.get('/', function(req, res){
  let context = {
    user: req.session.user.name,
    views: req.session.views.pathname
  };
  res.render('index', context);
});


//processing login form post
app.post('/login', function(req, res) {
  //capture form values and store in vars
  let username = req.body.username
    , password = req.body.password;

  //compare username value against list of USERS
  let thisUser = USERS.find(function(user){ //user arg is my list of user objects
    return user.username === username;
  });

  if(thisUser && thisUser.password === password){
    req.session.user = thisUser;
  }

  if(req.session.user){
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

//log out
app.post('/', function(req, res){
  delete req.session.user;
  res.redirect('/login');
});



app.listen(3000);
