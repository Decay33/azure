const crypto = require("crypto");

function createDocumentId(userId) {
  const ts = Date.now();
  const random = crypto.randomBytes(6).toString("hex");
  return `${userId}-${ts}-${random}`;
}

module.exports = {
  createDocumentId
};
