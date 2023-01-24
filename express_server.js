const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


function generateRandomString() {
  let output = Math.random().toString(36)
  return output.slice(output.length - 6);
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let newID = generateRandomString();
  console.log(newID);
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`); 
});

app.post("/register", (req, res) => {
  console.log(req.body.email, req.body.password); // Log the POST request body to the console
  let newID = generateRandomString();
  console.log(`new user: ${newID}`);
  users[newID] = {};
  users[newID].id = newID;
  users[newID].email = req.body.email;
  users[newID].password = req.body.password;
  console.log(users);
  res.cookie("user_id", users[newID].id);
  res.redirect(`/urls/`); 
});


app.post("/urls/:id/delete", (req, res) => {
  console.log(`${urlDatabase[req.params.id]} being deleted`); // Log the POST request body to the console
  delete urlDatabase[req.params.id];
  res.redirect(`/urls/`); 
});

app.post("/urls/:id", (req, res) => {
  console.log(`edit: ${req.params.id} being changed to ${req.body.longURL}`); // Log the POST request body to the console
  let updateID = req.params.id;
  urlDatabase[updateID] = req.body.longURL;
  res.redirect(`/urls/`); 
});


app.post("/login", (req, res) => {
  console.log(`login request for : ${req.body.username}`); // Log the POST request body to the console
  res.cookie("user", req.body.username)
  res.redirect(`/urls/`); 
});


app.post("/logout", (req, res) => {
  console.log(`logout request for : ${req.cookies["user"]}`); // Log the POST request body to the console
  res.clearCookie("user")
  // res.cookie("user", req.body.username)
  // let updateID = req.params.id;
  // urlDatabase[updateID] = req.body.longURL;
  res.redirect(`/urls/`); 
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  console.log(users)
  console.log(users[req.cookies.user_id])
  const templateVars = {
    username: req.cookies["user"],
    user_id: req.cookies["user_id"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("register", templateVars);
});

app.get("/urls", (req, res) => {
  // console.log(req.cookies);
  // console.log(users[req.cookies.user_id].email)
  const templateVars = { 
    username: req.cookies["user"],
    user: users[req.cookies.user_id],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["user"],
    user: users[req.cookies.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  // console.log(urlDatabase[req.params.id])
  const templateVars = {
    username: req.cookies["user"],
    user: users[req.cookies.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

