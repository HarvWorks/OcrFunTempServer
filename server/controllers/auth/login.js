const bcrypt            = require("bcrypt"),
      constants         = require("../../constants"),
      jwt               = require("jsonwebtoken"),
      promisePool       = require("../../config/mysql"),
      serverKeys        = require("../../../keys/keys");

module.exports = async (req, res) => {
  let query       = ``,
      queryData   = [],
      id          = '';

  // Expected login data
	if (!req.body.email || !req.body.password)
    return res.status(400).json({ message: "loginErr"  });

  // Validate email:
  if (!/@/.test(req.body.email))
    return res.status(400).json({ message: "loginErr" });

  // Pre-validate password:
	if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.password))
		return res.status(400).json({ message: "loginErr" });

  query = `SELECT HEX(id) id, passwordHash FROM users WHERE email = ? LIMIT 1`;
  queryData = [ req.body.email ];

  promisePool.execute(query, queryData)
    .then(data => {
      if (data.length === 0)
        throw { status: 400, message: "loginErr" };
      id = data[0].id;
      return bcrypt.compareAsync(req.body.password, data[0].passwordHash)
    })
    .then(isMatch => {
      if (!isMatch)
  			throw { status: 400, message: "loginErr" };
        // Create a new jwt token for the user
        const tsbToken = jwt.sign({
          id: id,
          exp: constants.expTime
        }, serverKeys.jwtKey);
        return res.status(200).json(tsbToken);
    })
    .catch(error => {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      return res.status(400).json({ message: "admin", error: error });
    });
}
