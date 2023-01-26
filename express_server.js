const express = require("express");
const methodOverride = require('method-override');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers.js");
const bcrypt = require("bcryptjs");

app.use(cookieSession({
  name: 'session',
  keys: ['correcthorsebatterystaple', 'littlebobbytables', 'listening'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "tester",
    visitorStats: {
      uniqueVisits: 0,
      totalVisits: 0,
      visitors: [],
      visitingTime: [],
    }
  }, 
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "tester",
    visitorStats: {
      uniqueVisits: 0,
      totalVisits: 0,
      visitors: [],
      visitingTime: [],
    }
  },
  "y4nk33": {
    longURL: "https://www.yankees.com",
    userID: "userRandomID",
    visitorStats: {
      uniqueVisits: 0,
      totalVisits: 0,
      visitors: [],
      visitingTime: [],
    }
  } 
};

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

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  console.log(req.body); 
  let newID = generateRandomString();
  console.log(`new link registered at ${newID}`);
  urlDatabase[newID] = {};
  urlDatabase[newID].longURL = req.body.longURL;
  urlDatabase[newID].userID = req.session.user_id;
  urlDatabase[newID].visitorStats = {
    uniqueVisits: 0,
    totalVisits: 0,
    visitors: [],
    visitingTime: [],
  };
  res.redirect(`/urls/${newID}`); 
});

app.post("/register", (req, res) => {
  console.log(`user: ${req.body.email} being registered`); 
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Username and Password cannot be blank.  \n");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("User Already Exists.  \n");
  }
  if (!getUserByEmail(req.body.email, users)) {
    let newID = generateRandomString();
    console.log(`new user: ${req.body.email} under ${newID}`);
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    users[newID] = {
      id: newID,
      email: req.body.email,
      password: hashedPassword,
    };
    console.log(`userbase now persists of ${users}`);
    req.session.user_id = users[newID].id;
    res.redirect(`/urls/`); 
  }
});

app.post("/login", (req, res) => {
  console.log(`login request for : ${req.body.email}`); 
  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Username or password did not match our records.  Please attempt again. \n");
  }
  let matchingPasswords = bcrypt.compareSync(req.body.password, getUserByEmail(req.body.email, users).password);
  if (!matchingPasswords) {
    return res.status(403).send("Username or password did not match our records.  Please attempt again. \n");
  }
  console.log(getUserByEmail(req.body.email, users).id, "successfully logged in");
  req.session.user_id = getUserByEmail(req.body.email, users).id;
  return res.redirect(`/urls/`);  
});


app.post("/logout", (req, res) => {
  console.log(`logout request for : ${req.session.user_id}`); 
  setTimeout(()=> req.session.user_id = null, 100); 
  setTimeout(()=> res.redirect(`/login/`), 300);
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls/`);
  }
  return res.redirect(`/login/`);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls/`);
  }
  const templateVars = { 
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls/`);
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
  };
  res.render("register", templateVars);
});

app.put("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  if (!urlDatabase[req.params.id]) {
    console.log("user action failed, item does not exist.");
    return res.send("Sorry, that item does not exist. \n");
  }
  let filteredDatabase = urlsForUser(req.session.user_id, urlDatabase);
  console.log(`edit: ${req.params.id} being changed to ${req.body.longURL}`); 
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

app.delete("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  if (!urlDatabase[req.params.id]) {
    console.log("user action failed, item does not exist.");
    return res.send("Sorry, that item does not exist. \n");
  }
  let filteredDatabase = urlsForUser(req.session.user_id, urlDatabase);
  console.log(req.params.id +" is requested to be deleted");
  if (!filteredDatabase[req.params.id]) {
    console.log("user action failed, insufficient access.");
    return res.send("Sorry, you do not have permission to delete that! \n");
  }
  delete urlDatabase[req.params.id];    // deleting from filteredDatabase won't do a thing because it's not a global variable
  res.redirect(`/urls/`); 
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  const templateVars = { 
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase),
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
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  let filteredDatabase = urlsForUser(req.session.user_id, urlDatabase);
  if (!filteredDatabase[req.params.id]) {
    return res.send("Sorry, you do not have permission to view that! \n");
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: filteredDatabase[req.params.id].longURL,
    visit: filteredDatabase[req.params.id].visitorStats,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("Sorry, this link does not exist! \n");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  if (!req.session.visitor_id) {
    req.session.visitor_id = generateRandomString();
  }
  if (!urlDatabase[req.params.id].visitorStats.visitors.includes(req.session.visitor_id)) {
    urlDatabase[req.params.id].visitorStats.uniqueVisits += 1;
  }
  urlDatabase[req.params.id].visitorStats.visitors.push(req.session.visitor_id);
  urlDatabase[req.params.id].visitorStats.totalVisits += 1;
  urlDatabase[req.params.id].visitorStats.visitingTime.push(Date());
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, this feature is for registered users only! \n");
  }
  let filteredDatabase = urlsForUser(req.session.user_id, urlDatabase);
  res.json((filteredDatabase));
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});