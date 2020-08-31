const bcrypt            = require("bcrypt"),
      crypto            = require("crypto"),
      constants         = require("../../constants"),
      jwt               = require("jsonwebtoken"),
      promisePool       = require("../../config/mysql"),
      serverKeys        = require("../../../keys/keys");

module.exports = async (req, res) => {
  let query       = ``,
      queryData   = [];

  // Expected form data. Check if the data has been passed to the server (as a JSON object) and if not return
	if (!req.body.email || !req.body.password)
    return res.status(400).json({ message: "missingFields" });

  // Validate email:
	if (!/@/.test(req.body.email))
    return res.status(400).json({ message: "invalidEmail." });

  // Validate password:
	if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.password))
		return res.status(400).json({ message: "badPassword" });

  const id = crypto.randomBytes(16).toString('hex')

  query = `INSERT INTO users SET id = UNHEX(?), email = ?, passwordHash = ?, createdAt = NOW(), updatedAt = NOW()`;

  queryData = [
    id,
    req.body.email
  ];

  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      // Add the password to the query after the password has been hashed
      queryData.push(hash)
      return promisePool.execute(query, queryData)
    })
    .then(() => {
      // Create a new jwt token for the user
      const tsbToken = jwt.sign({
        id: id,
        exp: constants.expTime
      }, serverKeys.jwtKey);
      res.status(200).json(tsbToken);
    })
    .catch(error => {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      if (error.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "User already exists, please login."});
      return res.status(400).json({ message: "admin", error: error });
    });
}
