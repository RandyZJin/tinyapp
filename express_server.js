const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['correcthorsebatterystaple'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// the return varies digits hence slicing is done proportionate to length from end to ensure 6 digits.
const generateRandomString = () => {
  let output = Math.random().toString(36)
  return output.slice(output.length - 6);
};

const urlsForUser = (id) => {
  let filteredDatabase = {};
  for (let ids in urlDatabase) {
    if (urlDatabase[ids].userID === id) {
      filteredDatabase[ids] = urlDatabase[ids];
    }
  }
  // console.log(filteredDatabase);
  return filteredDatabase;
};

// urlsForUser(req.cookies.user_id)
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "test",
  }, 
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "test",
  },
  "y4nk33": {
    longURL: "https://www.yankees.com",
    userID: "userRandomID",
  } 
};

const bcrypt = require("bcryptjs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
  tester: {
    id: "tester",
    email: "bob@bob.com",
    password: bcrypt.hashSync("bob", 10),
  },
};

// const password = "purple-monkey-dinosaur"; // found in the req.body object
// const hashedPassword = bcrypt.hashSync(password, 10);


const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
} 


app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  console.log(req.body); // Log the POST request body to the console
  let newID = generateRandomString();
  console.log(newID);
  urlDatabase[newID] = {};
  urlDatabase[newID].longURL = req.body.longURL;
  urlDatabase[newID].userID = req.session.user_id;
  res.redirect(`/urls/${newID}`); 
});



app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  if (!urlDatabase[req.params.id]) {
    console.log("user action failed, item does not exist.");
    return res.send("Sorry, that item does not exist. \n");
  }
  let filteredDatabase = urlsForUser(req.session.user_id);
  console.log(`${urlDatabase[req.params.id]} being deleted`); // Log the POST request body to the console
  if (!filteredDatabase[req.params.id]) {
    console.log("user action failed, insufficient access.");
    return res.send("Sorry, you do not have permission to delete that! \n");
  }

  delete urlDatabase[req.params.id]; // deleting from filteredDatabase won't do a thing because it's not a global variable
  res.redirect(`/urls/`); 
});


app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  if (!urlDatabase[req.params.id]) {
    console.log("user action failed, item does not exist.");
    return res.send("Sorry, that item does not exist. \n");
  }
  let filteredDatabase = urlsForUser(req.session.user_id);
  console.log(`edit: ${req.params.id} being changed to ${req.body.longURL}`); // Log the POST request body to the console
  if (!filteredDatabase[req.params.id]) {
    console.log("user action failed, insufficient access.");
    return res.send("Sorry, you do not have permission to edit that! \n");
  }
  let updateID = req.params.id;
  if (!urlDatabase[updateID]) {
    urlDatabase[updateID] = {};
  }
  urlDatabase[updateID].longURL = req.body.longURL;
  res.redirect(`/urls/`); 
});

app.post("/register", (req, res) => {
  console.log(`user: ${req.body.email} password: ${req.body.password}`); // Log the POST request body to the console
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Username and Password cannot be blank.  \n");
  }
  if (getUserByEmail(req.body.email)) {
    return res.status(400).send("User Already Exists.  \n");
  }
  if (!getUserByEmail(req.body.email)) {
    let newID = generateRandomString();
    console.log(`new user: ${newID}`);
    users[newID] = {};
    users[newID].id = newID;
    users[newID].email = req.body.email;
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[newID].password = hashedPassword;
    console.log(users);
    res.cookie("user_id", users[newID].id);
    res.redirect(`/urls/`); 
  }
});

app.post("/login", (req, res) => {
  console.log(`login request for : ${req.body.email}`); // Log the POST request body to the console
  if (getUserByEmail(req.body.email)) {
    let matchingPasswords = bcrypt.compareSync(req.body.password, getUserByEmail(req.body.email).password);
    if (matchingPasswords) {
      console.log(getUserByEmail(req.body.email).id, "successfully logged in");
      req.session.user_id = getUserByEmail(req.body.email).id;
      return res.redirect(`/urls/`);  
    }
    return res.status(403).send("Username or password did not match our records.  Please attempt again. \n");
  }
  return res.status(403).send("Username or password did not match our records.  Please attempt again. \n");

});


app.post("/logout", (req, res) => {
  console.log(`logout request for : ${req.session.user_id}`); // Log the POST request body to the console
  // res.clearCookie("user_id")
  setTimeout(()=>req.session = null, 100);
  setTimeout(()=> res.redirect(`/login/`), 300);
});

app.get("/", (req, res) => {
  console.log(req.session.user_id); // test page
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls/`);
  }
  // console.log(req.session);
  // console.log(users[req.cookies.user_id].email)
  const templateVars = { 
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls/`);
  }
  console.log(users);
  console.log(users[req.session.user_id]);
  const templateVars = {
    user_id: req.session.user_id,
    id: req.params.id,
    // longURL: urlsForUser(req.cookies.user_id)[req.params.id].longURL
  };
  res.render("register", templateVars);
});

app.get("/urls", (req, res) => {
  // console.log("testing user id: ", req.session.user_id);
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  // console.log(req.cookies);
  // console.log(users[req.cookies.user_id].email)
  const templateVars = { 
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id) 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect(`/login/`);
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    // longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  // console.log(urlDatabase[req.params.id])
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  let filteredDatabase = urlsForUser(req.session.user_id);
  if (!filteredDatabase[req.params.id]) {
    return res.send("Sorry, you do not have permission to view that! \n");
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlsForUser(req.session.user_id)[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("Sorry, this link does not exist! \n");
  }
  const longURL = urlDatabase[req.params.id].longURL;
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

