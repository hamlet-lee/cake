var mysql      = require('mysql');
/* = mysql.createPool({
  connectionLimit: 10,
  host     : 'localhost',
  user     : 'cake',
  password : 'cakeisme',
  database : 'cake',
  charset : 'UTF8_GENERAL_CI'
});
*/

var jsonfile = require('jsonfile')
var file = 'pool.json'
var poolSpec = jsonfile.readFileSync(file);
console.log("read file" + JSON.stringify( poolSpec ));

var pool = mysql.createPool( poolSpec );
 
var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('client'));
app.get('/add/:ts/:kind/:quantity', function (req, res) {
      var q = `insert into tbl_sell(ts, kind, quantity) values (${req.params.ts}, '${req.params.kind}', ${req.params.quantity})`;
      console.log("sql=" + q);
      pool.query(q);
      res.end( "OK");
});

var lastMsg = "";

app.post('/addMany', function (req, res){
  console.log("add many ...");
  console.log( req.body );
  var arr = req.body;
  var n = 0;
  var old = 0;
  var num = arr.length;
  arr.forEach( function(elem) {
    console.log( "adding item: " + JSON.stringify(elem) );
    var ts;
    if( typeof(elem.ts) == "strting" && elem.ts.indexOf(' ') < 0 ){
	ts = `FROM_UNIXTIME(${(elem.ts * 0.001)})`;
    } else{
        ts = `'${elem.ts}'`; 
    }
    var q = `insert into tbl_sell(ts, kind, quantity, seller) values ( ${ts}, '${elem.kind}', ${elem.quantity}, '${elem.seller}' )`;
    pool.query(q, function(err){
        if( err != undefined && err.code == "ER_DUP_ENTRY" ){
		old=old+1;
		console.log("old");
        }else{
		n=n+1;
		console.log("new");
	}
	num--;
	if( num == 0 ){
		lastMsg = `uploaded old ${old}, new ${n}`; 
		//console.log(res);
		res.end(lastMsg);
	}
    }); 
  });
  console.log("end");
  //res.end("OK");
});

app.get('/lastMsg', function(req, res){
	res.end( lastMsg );
});

app.get('/all', function( req, res){
      var q = "select * from tbl_sell";
      pool.query(q, function(err, rows){
      		console.log( JSON.stringify(rows) );
		res.end( JSON.stringify(rows) );
	});
});
var server = app.listen(18080, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

