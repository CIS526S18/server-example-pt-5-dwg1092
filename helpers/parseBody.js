const qs = require('querystring');

function parseBody(req, res, callback){
 var chunks = [];
 
 req.on('data', function(data){
    chunks.push(data);
 });

 req.on('error', function(err){
    console.log(err);
    res.statusCode = 500;
    res.end("Server error");
 });

 req.on('end', function(){
     var buffer = Buffer.join(chunks);

     //Determine the content type of the post request
     switch(req.headers['content-type'].split(';')[0]){
         
          // could be:
     case "text/plain":
        req.body = buffer.toString();
        callback(req, res);
        return;
     case "multipart/for-data":
        // 1) extract boundary
        var match = /boundary=(.+);?/.exec(req.headers['content-type']);
        // 2) parse the body
        req.body = parseMultipartBody(buffer, match[1]);
        callback(req, res);
        return;
     case "application/x-www-form-urlencoding":
        req.body = qs.parse(buffer.toString());
        callback(req, res);
        return;
     case "application/json":
        req.body = JSON.parse(buffer.toString());
        return;
    default:
        res.statusCode = 400;
        res.end("Bad Request");
     }
 });
}


function parseMultipartBody(buffer, boundary){
    var start = 0;
    var end = 0;
    var sections = [];
    // find the first index of the boundary bytes
    // in our buffer
    start = buffer.indexOf(boundary, start);
    end = buffer.indexOf(boundary, start);
    while(end !== -1){
        sections.push(Buffer.from(start, end));
        start = end;
        end = buffer.indexOf(boundary, start);
    }

}