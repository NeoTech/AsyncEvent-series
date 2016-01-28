/**
 * Created by Andreas Pettersson # andreas@roughedge.se released under MIT license.
    USEAGE:
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
 *
 */
var EventEmitter = require('events').EventEmitter;
module.exports = Async

function Async(funcArray, groupSize) {
    if (!(this instanceof Async)) {
        if (global.MODE_LVL < 5) {
            console.log('Not an instance; returning new AsyncEventSeries Client');
        }
        return new Async(funcArray);
    }
    var _self = this;
    _self._emitter = new EventEmitter();
    _self.runjob = funcArray;
    _self.groupSize = groupSize || 1000;
    _self.firstrun = true;
    _self.splitjob();
    return _self;
}
Async.prototype.splitjob = function() {
    var _self = this;
    _self.runjob = _self.runjob.map(function(e, i) {
        return i % _self.groupSize === 0 ? _self.runjob.slice(i,i + _self.groupSize) : null;
    }).filter(function(e) { return e; });
};
Async.prototype.series = function(array) {
    var _self = this;
    var dataset = new Array();
    _self.runjob.forEach(function(item, key) {
        dataset[key] = new AsyncEventSeries(item);
        dataset[key].on('done',function(){
            dataset[key] = undefined;
            delete(dataset[key]);
        });
        dataset[key].on('finalized', function() {
           _self.emit('done');
        });
        if(dataset.length > 1) {
            dataset[key - 1].setnext(dataset[key]);
        }
    });
    dataset[0].emit('next');
    delete(dataset);
    return _self;
};
Async.prototype.on = function() { this._emitter.on.apply(this._emitter, arguments); return this; };
Async.prototype.emit = function() { this._emitter.emit.apply(this._emitter, arguments); return this; };

function AsyncEventSeries(funcArray) {
    if (!(this instanceof AsyncEventSeries)) {
            console.log('Not an instance; returning new AsyncEventSeries Client');
        return new AsyncEventSeries(funcArray);
    }
    var _self = this;
    _self.runjob = funcArray;
    _self._emitter = new EventEmitter();
    _self.on('next', function() { _self.run(arguments); });
    _self.on('done', function() { var args = arguments[0][0][0][0]; _self.endit(args); });
    return _self;
};

AsyncEventSeries.prototype.run = function() {
    var _self = this;
    if(_self.runjob.length > 0) {
        var t = _self.runjob.shift();
        if (typeof t === 'function') {
            var args = arguments;
            setImmediate(function() {
                if(typeof args === 'object') {
                    var args = args[0][0][0];
                    var data = new Array();
                    for(var x in args) {
                     data.push(args[x]);
                    }
                }
                t(function () {
                    _self.emit('next', arguments);
                }, data);
            });
        } else {
            _self.emit('next', arguments);
        }
        delete(t);
    } else {
        _self.emit('done', arguments);
    }
    return _self;
};
AsyncEventSeries.prototype.endit = function() {
    var _self = this;
    if(typeof _self.nextjob === 'object') {
        _self.nextjob.emit('next', arguments);
    } else {
        _self.emit('finalized');
    }
    delete(_self);
};
AsyncEventSeries.prototype.setnext = function(obj) {
    var _self = this;
    _self.nextjob = obj;
};
AsyncEventSeries.prototype.on = function() { this._emitter.on.apply(this._emitter, arguments); return this; };
AsyncEventSeries.prototype.emit = function() { this._emitter.emit.apply(this._emitter, arguments); return this; };
