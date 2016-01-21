var Async = require('./AsyncEventSeries');
var x = new Array();

function factory(i) {
    var j = i;
    return function(call) {
        console.log('Executing #%s', j);
        call();
    }
}

for(i = 0; i < (10000*2); i++) {
    x.push(factory(i));
}

var y = new Async(x,2000).series().on('done', function() {
   console.log('Series is done');
});
