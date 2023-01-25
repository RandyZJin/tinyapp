const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(getUserByEmail("user@example.com", testUsers), testUsers[expectedUserID]);
  });
  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    // Write your assert statement here
    assert.deepEqual(getUserByEmail("john@doe.com", testUsers), undefined);
  });
});

describe('generateRandomString', function() {
  it('should return a string with a length of six', function() {
    const randomID1 = generateRandomString();
    // Write your assert statement here
    assert.equal(randomID1.length, 6);
  });
  it('should not return the same string twice in a row', function() {
    const randomID1 = generateRandomString();
    const randomID2 = generateRandomString();
    assert.notEqual(randomID1, randomID2);
  });
});

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "tester",
  }, 
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "tester",
  },
  "asdf12": {
    longURL: "https://www.espn.com",
    userID: "123abc",
  } 
};

describe('urlsForUser', function() {
  it('should return a database with the creator\'s userID matching the specified userID', function() {
    const userID = "123abc";
    const filteredDatabase = {
      "asdf12": {
      longURL: "https://www.espn.com",
      userID: "123abc",
    }
   }
    // Write your assert statement here
    assert.deepEqual(urlsForUser(userID, urlDatabase), filteredDatabase);
  });
  it('should return an empty object if user did not create any links', function() {
    const userID = "g14nt5";
    assert.deepEqual(urlsForUser(userID, urlDatabase), {});
  });
  it('should not return an entire library', function() {
    assert.notDeepEqual(urlsForUser(null, urlDatabase), urlDatabase);
  });
  it('should not return anything if user is unspecified', function() {
    assert.deepEqual(urlsForUser(null, urlDatabase), {});
  });
});
