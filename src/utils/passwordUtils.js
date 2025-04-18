/**
 * Generates a cryptographically secure random password
 * @returns {string} A password with at least one uppercase, one lowercase, one number and one special character
 */
export const generateRandomPassword = () => {
  const charSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    special: "!@#$%^&*",
  };

  const length = 12;
  const crypto = window.crypto || window.msCrypto;
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  const password = [
    charSets.uppercase[randomValues[0] % charSets.uppercase.length],
    charSets.lowercase[randomValues[1] % charSets.lowercase.length],
    charSets.numbers[randomValues[2] % charSets.numbers.length],
    charSets.special[randomValues[3] % charSets.special.length],
  ];

  const allChars = Object.values(charSets).join("");
  for (let i = 4; i < length; i++) {
    password.push(allChars[randomValues[i] % allChars.length]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
};
