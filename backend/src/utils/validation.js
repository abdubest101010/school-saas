const MIN_PASSWORD_LENGTH = 8;

// Owner/Admin now choose the password for accounts they create, instead of
// the system generating one — this just makes sure whatever they type is
// at least reasonable before it gets hashed.
function isValidPassword(password) {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

module.exports = { isValidPassword, MIN_PASSWORD_LENGTH };
