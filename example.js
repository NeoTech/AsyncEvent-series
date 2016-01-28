//var Async = require('asyncevent-series');
var Async = require('./AsyncEventSeries');
var x = new Array();

function factory(i) {
    var j = i;
    return function(call,data) {
        console.log(j);
        j++;
        call(j);
    }
}

for(i = 0; i < (10); i++) {
    x.push(factory(i));
}

var y = new Async(x,5).series().on('done', function() {
   console.log('Series is done');
});