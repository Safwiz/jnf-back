const bcrypt = require('bcrypt');

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  
  return randomString;
}

function hashPassword(password) {
  // Generate a salt
  const saltRounds = 10; // Number of salt rounds determines the complexity of the hashing
  const salt = bcrypt.genSaltSync(saltRounds);

  // Hash the password using the generated salt synchronously
  const hashedPassword = bcrypt.hashSync(password, salt);

  return hashedPassword;
}

// Export utility functions
module.exports = {
  generateRandomString,
  hashPassword,
};