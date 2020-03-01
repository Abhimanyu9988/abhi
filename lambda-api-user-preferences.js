const signalFxLambda = require('signalfx-lambda');
const opentracing = require('opentracing');
const { initTracer } = require('jaeger-client');
const AWS = require('aws-sdk');
const vandium = require( 'vandium' );

var mysql = require('mysql');
function createTracer() {
    const accessToken = process.env.SIGNALFX_ACCESS_TOKEN;

    const config = {
        serviceName: process.env.SIGNALFX_SERVICE_NAME,
        sampler: {
            type: 'const',
            param: 1
        },
        reporter: {
            collectorEndpoint: process.env.SIGNALFX_INGEST_URL
        }
    };

    if (accessToken) {
        // SignalFx supports Basic authentication with username "auth" and access token as password
        config.reporter.username = 'auth';
        config.reporter.password = process.env.SIGNALFX_ACCESS_TOKEN;
    }

    const options = { logger: console };
    const tracer = initTracer(config, options);
    // Register our tracer instance as the global tracer for easy access
    // throughout Lambda function.
    opentracing.initGlobalTracer(tracer);

    return tracer;
};

const flushTracing = (statusCode) => {
    rootSpan.setTag(opentracing.Tags.HTTP_STATUS_CODE, statusCode);
    rootSpan.finish();
};


const vandium = require( 'vandium' );

var mysql = require('mysql');

exports.handler = vandium.generic().handler( (event, context, callback) => {

  var connection = mysql.createConnection({
    host     : process.env.DB_ENDPOINT,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
  });
  switch(event.httpMethod){
    case "GET":
    console.log("GET!!");
    get(event,context,callback);
    break;
    case "POST":
    console.log("POST!!!");
    post(event,context,callback);
    break;

    case "DELETE":
    console.log("DELETE!!!");
    del(event,context,callback);
    break;
    case "PATCH":
    patch(event,context,callback);
    console.log("PATCH!!");
    break;
  }
  function get(event,context,callback) {
  var sql = "SELECT * FROM user_view where id = " + connection.escape(event.pathParameters.item_id );

  connection.query(sql, function (error, results, fields) {
  if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          "body" : JSON.stringify(data),
          headers: { 'Content-Type': 'text/plain' },
        });
        return;
      }
  var response = {
        "statusCode": 200,
        "body": JSON.stringify(results),
        "isBase64Encoded": false
    };
	callback( null, response );
	}
  );
}
  function post(event,context,callback){
    const data = JSON.parse(event.body);

     const listtypeid = data.list_type_id;
     const viewname = data.name;
     const preference = data.preferences;
    var sql = "INSERT INTO user_view(name,preferences,list_type_id) ";
    sql = sql + " VALUES("  + connection.escape(viewname) + "," + connection.escape(preference) + "," + connection.escape(listtypeid) +  ")";
    connection.query(sql, function (error, results, fields) {
    if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          "body" : JSON.stringify(data),
          headers: { 'Content-Type': 'text/plain' },
        });
        return;
      }
    var response = {
      "body" : JSON.stringify(listtypeid),
      "statusCode" : 201

    };
    callback( null, response);

  });
  }

  function patch(event,context,callback){
    var data = JSON.parse(event.body);
    var preference = data.preferences;
    var viewname = data.name;
    var viewid = data.id;

    var sql = "UPDATE user_view SET user_view.name = " + connection.escape(viewname) + "," + "user_views.preferences =" + connection.escape(preference) + "WHERE user_view.id = " + connection.escape(viewid);
    connection.query(sql,function(error,results,fields){
    if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
        });
        return;
      }
    var response = {
        "statusCode": 200,
        "headers": {
            "my_header": "my_value"
        },
        "body": JSON.stringify(event.requestContext.protocol ),
        "isBase64Encoded": false
    };

    callback(null, response);
    } );
  }

  function del(event,context,callback){
    const data = JSON.parse(event.body);
    const viewid = data.id;
    var sql = "DELETE FROM user_view where id = " + connection.escape(viewid);
    connection.query(sql, function(error,results,fields){
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
        });
        return;
      }
      var response = {
        "statusCode": 200,
        "headers": {
            "my_header": "my_value"
        },
        "body": JSON.stringify(event.requestContext.protocol ),
        "isBase64Encoded": false
    };

      callback(null, response);
    });
  }


})
