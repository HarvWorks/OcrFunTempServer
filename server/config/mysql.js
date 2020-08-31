const mysql = require('mysql2');
const password = require('../../keys/keys').mysqlPassword;
const SqlString = require('sqlstring');

const using = Promise.using;

function queryFormat(sql, values, timeZone) {
	sql = SqlString.format(sql, values, false, timeZone);
	sql = sql.replace(/'NOW\(\)'/g, "NOW()")
		.replace(/'UNHEX\(REPLACE\(UUID\(\), \\'-\\', \\'\\'\)\)'/g, "UNHEX(REPLACE(UUID(), '-', ''))")
		.replace(/'UNHEX\('/g, "UNHEX(")
		.replace(/'\)'/g, "')")
		.replace(/\\/g, "");
	return sql;
};

const pool = mysql.createPool({
	host: 'localhost',
	port: '3306',
	user: 'root',
	password: password,
	database: 'ocrFun',
	queryFormat: queryFormat
});

module.exports = pool.promise();
