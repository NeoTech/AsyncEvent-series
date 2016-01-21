A library with the aim to circumvent the max callstack exceded error using events and setImmediate pacing.

Example of useage.... In this case with mysql from a dev database with 500.000+ lines of clients.
----------------------
'''
var Async = require('asyncevent-series');
var x = new Array();
var pool = require('./globals');

function factory(i) {
    var j = i;
    return function(call,data) {
        pool.getConnection(function(err,connection) {
            var sql = "select * from clients where password_id is not null order by clients_id limit " + j + ",1";
            connection.query(sql, function(err,row,fields) {
                if(err) { console.log(err); }
                connection.release();
                if(typeof data[0] === 'function') {
                    (data[0])()();
                }
                console.log('Current selected id: %s', row[0].clients_id, j);
                call((function(){ return function() { console.log('---Previous selected id was :#' + row[0].clients_id); }}));
            });
        });
    }
}

for(i = 0; i < (10); i++) {
    x.push(factory(i));
}

var y = new Async(x,5).series().on('done', function() {
    pool.end(function(err) {
        console.log('Series is done');
    })
});
'''