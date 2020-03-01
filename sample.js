const vandium = require( 'vandium' );

var mysql = require('mysql');

exports.handler = vandium.generic().handler( (event, context, callback) => {

  var connection = mysql.createConnection({
    host     : 'database-1-instance-1.cripgiuirctt.us-east-2.rds.amazonaws.com',
    user     : 'admin',
    password : 'abcdefghijklmnop123!',
    database : 'test'
  });
  if (event.httpMethod === 'GET') {
	connection.query('SELECT * FROM items', function (error, results, fields) {
  var response = {
        "statusCode": 200,
        "headers": {
            "my_header": "my_value"
        },
        "body": JSON.stringify(results),
        "isBase64Encoded": false
    };
	callback( null, response );
	}
  );
}})
