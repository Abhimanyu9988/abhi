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
    // case "PUT":
    // console.log("PUT!!");
    // put(event,context,callback);
    // break;
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
  const data = JSON.parse(event.body);
  const listtypeid = data.list_type_id;
  const preference = data.preferences;
  const finid = data.id;
  // var ifsql = "SELECT user_default_views.view_id FROM user_default_views";
  // if ifsql == data.id{
  // }
  var sql = "BEGIN TRANSACTION"
  sql = sql + "DECLARE @  "
  var sql = "SELECT user_views.id,user_views.name,user_views.preferences FROM user_views where list_view_id = " + connection.escape(event.list_view_id)
  connection.query(sql, function (error, results, fields) {
  //var sql = "SELECT list_view_id,name,preferences FROM User_view_table where list_view_id = " + connection.escape(event.list_view_id);
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
    //const userid = data.user_id;
    const ids = data.id;
    const listtypeid = data.list_type_id;
    const nam = data.name;
    const preference = data.preferences;
    // var checksql = "SELECT user_default_views.view_id FROM user_default_views";
    // if
    var sqlcheck = "BEGIN TRANSACTION" + "DECLARE @view_id int";
    sqlcheck = sqlcheck + "INSERT into user_default_views (view_id,list_type_id) VALUES (" + connection.escape(ids) + "," + connection.escape(listtypeid) + ")";
    sqlcheck = sqlcheck + "SELECT @view_id = SCOPE_IDENTITY()";
    sqlcheck = sqlcheck + "INSERT into user_views(id,list_type_id,name,preferences) VALUES (@view_id, " + connection.escape(listtypeid) + "," + connection.escape(name) + "," + connection.escape(preferences) + ")";
    sqlcheck = sqlcheck + "SELECT @view_id = SCOPE_IDENTITY";
    sqlcheck = sqlcheck + "INSERT into list_types(id,name) VALUES (@view_id, " + connection.escape(nam) + ")";
//    var sql = "INSERT INTO User_view_table(listtypeid,nam,preference) ";//VALUES(eventid,names)";

//    sql = sql + " VALUES(" + connection.escape(listtypeid)+ " , " +connection.escape(names) + "," +connection.escape(preference) + ")";
    connection.query(sqlcheck, function (error, results, fields) {
    if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(names),
        });
        return;
      }
    var response = {
      "body" : JSON.stringify((eventid)),
      "statusCode" : 201

    };
    callback( null, response);

  });
  }

  function patch(event,context,callback){
    var data = JSON.parse(event.body);
    var preference = data.preferences;
    var nam = data.name;
    var listtypeid = data.list_type_id;
    var ids = data.id;
    var sql = "BEGIN TRANSACTION";
    sql = "UPDATE user_views SET user_views.name = " + connection.escape(nam) + ", user_views.preferences = " + connection.escape(preference) + "FROM user_views INNER JOIN list_types on list_types.name = user_views.name INNER JOIN user_default_views on list_types.id = user_default_views.list_type_id";
    //
    //sql = sql + "UPDATE user_views SET list_types.name = " + connection.escape(nam) + "," + "user_views.id = " + connection.escape(ids) + "FROM list_types WHERE" +
    //var sql = "UPDATE User_view_table SET preferences" + connection.escape(preference) + "name" + connection.escape(nam) + "WHERE list_type_id = " + connection.escape(listtypeid);
    //sql = sql + "preferences" + connection.escape(event.preferences) + "name" + connection.escape(event.name) + "where list_type_id = " + connection.escape(even.list_type_id);
    connection.query(sql,function(error,results,fields){
    var response = {
      "statusCode" : 201,
      //"body": JSON.stringify(results),
      //"isBase64Encoded": false
    }

    callback(null, response);
    } );
  }

  function del(event,context,callback){
    const data = JSON.parse(event.body);
    listviewid = data.list_view_id;
    var listviewid =
    var sql = "DELETE FROM user_views where listviewid = " + connection.escape(listviewid);
    connection.query(sql, function(error,results,fields){
      var response = {
        //"body" : JSON.stringify(listviewid)
        "statusCode" : 204
      };

      callback(null, response);
    });
  }

  // function patch(event,context,callback){
  //   var sql =
  // }
})
