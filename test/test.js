var test = require("tape");
var through = require("../");
var PassThrough = require("stream").PassThrough;

test(".through(func) - utf8", function(t){
    var stream = through(function(data){
        return data + "yeah?";
    });
    
    stream.on("readable", function(){
        var chunk = this.read();
        if (chunk){
            t.strictEqual(chunk, "cliveyeah?");
            t.end();
        }
    });
    stream.setEncoding("utf8");
    stream.end("clive");
});

test(".through(func) - buffer", function(t){
    var stream = through(function(data){
        return Buffer.concat([ data, Buffer([ 2 ])]);
    });
    
    stream.on("readable", function(){
        var chunk = this.read();
        if (chunk){
            t.ok(chunk.equals(Buffer([ 1, 2 ])));
            t.end();
        }
    });

    stream.end(Buffer([ 1 ]));
});
