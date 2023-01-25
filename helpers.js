const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

// the return varies digits hence slicing is done proportionate to length from end to ensure 6 digits.
const generateRandomString = () => {
  let output = Math.random().toString(36)
  return output.slice(output.length - 6);
};

const urlsForUser = (id, database) => {
  let filteredDatabase = {};
  for (let ids in database) {
    if (database[ids].userID === id) {
      filteredDatabase[ids] = database[ids];
    }
  }
  return filteredDatabase;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser};