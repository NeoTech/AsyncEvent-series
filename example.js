var Async = require('./AsyncEventSeries');
var x = new Array();

function factory(i) {
    var j = i;
    return function(call,data) {
        console.log('Executing #%s', j);
        var data = data[0] || false;
        console.log(data);
        call('Passed on data ' + j);
    }
}

for(i = 0; i < (5*2); i++) {
    x.push(factory(i));
}

var y = new Async(x,2000).series().on('done', function() {
    console.log('Series is done');
});