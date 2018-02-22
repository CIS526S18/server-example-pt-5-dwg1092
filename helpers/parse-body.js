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
     var buffer = Buffer.concat(chunks);

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
    start += boundary.length;
    end = buffer.indexOf(boundary, start);
    while(end !== -1){
        sections.push(buffer.slice(start, end - 4));
        start = end + boundary.length;
        end = buffer.indexOf(boundary, start);
    }

    // We now have all body sections in the sections array
    // Parse into value pairs
    properties = {};
    sections.map(parseContent).forEach(function(s, i) {
        properties[property.key] = property.value;
    });
    return properties;
}

function parseContent(content){
    var index = content.indexOf('\n\n');
    var headers = content.slice(0, index).toString();
    var body = content.slice(index + 2);
    //Determine if this is a form field or file
    if(header.indexOf("filename") > 0){
        // This is a file
        var match = /name="(.+)";\s*filename="(.+)"/.exec(headers);
        return{
            key: match[1],
            value: {
                filename: match[2],
                data: body
            }
        }
    }else{
        // this is a form field
        return{
            key: /name="(.+)";?/.exec(headers)[1],
            value: body.toString()
        }
        
    }
}

module.exports = parseBody;