var XojoCodeGenerator = function() {
	this.generate = function(context, requests, options) {
		for(var i in requests) {
			var request = requests[i];
			var client_code = [];
			client_code[client_code.length] = "// " + request.name;
			if (request.description != "") {
				client_code[client_code.length] = "// " + request.description;
			}
			client_code[client_code.length] = "";
		
			var vars = request.variables;
			if (vars.length > 0) {
				client_code[client_code.length] = "// Variable Definitions"
				for(i=0;i<vars.length;i++) {
					var desc = "// " + vars[i].name + ": " + vars[i].description;
					if (vars[i].required) {
						desc += " (required)";
					}
					client_code[client_code.length] = desc;
					client_code[client_code.length] = "// " + vars[i].type;
				}
				client_code[client_code.length] = "";
			}
		
			client_code[client_code.length] = "// Set up the socket";
			var secure = (request.url.indexOf("https://")>-1);
			if(secure) {
				client_code[client_code.length] = "dim h as new HTTPSecureSocket";
				client_code[client_code.length] = "h.Secure = True";
				client_code[client_code.length] = "h.ConnectionType = h.SSLv23";
				client_code[client_code.length] = "";
			} else {
				client_code[client_code.length] = "dim h as new HTTPSocket";
				client_code[client_code.length] = "";
			}
		
			var headers = request.headers;
			var hasAuth = false
			if(JSON.stringify(headers) != "{}") {
				client_code[client_code.length] = "// Headers";
				for (var headerName in headers) {
					var headerValue = headers[headerName];
					if(!(request.body != "" && headerName == "Content-Type")) {
						client_code[client_code.length] = "h.SetRequestHeader(\"" + headerName + "\",\"" + headerValue + "\")";	
					}
				}
				client_code[client_code.length] = "";
			}
		
			// Deal with the different body types
			var body;
			var mimeType;
			console.log(request.body);
			if(request.body != "") {
				client_code[client_code.length] = "// Request Body";
			}
			// Figure out what kind of body the user specified
			if(request.multipartBody) {
				body = request.multipartBody;
				if(Object.size(body) > 0) {
					mimeType = "multipart/form-data";
					client_code[client_code.length] = "// Type = Multipart";
					client_code[client_code.length] = "Dim sa() As String";
					for(var propertyName in body) {
						var key = propertyName;
						var value = body[key];
						client_code[client_code.length] = "sa.append \"" + key + "=\" + EncodeURLComponent(\"" + value + "\")";
					}
					client_code[client_code.length] = "Dim data as String = Join(sa,\"&\")";
				}
			} else if(request.jsonBody) {
				body = request.jsonBody;
				mimeType = "application/json";
				client_code[client_code.length] = "// Type = JSON"
				var jsontext = JSON.stringify(body).replace(/\"/g,"\"\"");
				client_code[client_code.length] = "Dim data as String = \"" + jsontext + "\"";
			} else if(request.urlEncodedBody) {
				body = request.urlEncodedBody;
				if(Object.size(body) > 0) {
					mimeType = "application/x-www-form-urlencoded";
					client_code[client_code.length] = "// Type = Form URL-Encoded"
					client_code[client_code.length] = "Dim sa() as String";
					for(var propertyName in body) {
						var key = propertyName;
						var value = body[key];
						client_code[client_code.length] = "sa.append \"" + key + "=\" + EncodeURLComponent(\"" + value + "\")";
					}
					client_code[client_code.length] = "Dim data as String = Join(sa,\"&\")";
				}
			} else if(request.body) {
				if(request.body.length > 0) {
					var replaceCRLF = new RegExp('\n', 'g');
					var replaceQuotes = new RegExp('\"', 'g');
					body = request.body;
					mimeType = "text/plain";
					client_code[client_code.length] = "// Type = Text"
					client_code[client_code.length] = "Dim data as String = \"" + body.replace(replaceQuotes,"\"\"").replace(replaceCRLF, "\" + EndOfLine + \"") + "\"";
				}
			}
		
			if(mimeType) {
				client_code[client_code.length] = "";
				client_code[client_code.length] = "// Assign to the Request's Content";
				client_code[client_code.length] = "h.SetRequestContent(data,\"" + mimeType + "\")";
				client_code[client_code.length] = "";
			}
		
			var paramNames = request.getUrlParametersNames();
			var params = request.getUrlParameters();
			if(paramNames.length > 0) {
				client_code[client_code.length] = "// URL Parameters";
				client_code[client_code.length] = "dim parameters() as string";
				for(i=0;i<paramNames.length;i++) {
					client_code[client_code.length] = "parameters.append \"" + paramNames[i] + "=\" + EncodeURLComponent(\"" + params[paramNames[i]] + "\")";
				}
				client_code[client_code.length] = "";
			}
			client_code[client_code.length] = "// Set the URL";
			client_code[client_code.length] = "dim url as string = \"" + request.getUrlBase(false) + "\"";
			if(paramNames.length > 0) {
				client_code[client_code.length] = "url = url + \"?\" + Join(parameters,\"&\")";
			}
			client_code[client_code.length] = ""
			client_code[client_code.length] = "// Send Synchronous Request"
			client_code[client_code.length] = "dim s as string = h.SendRequest(\"" + request.method + "\",url,30)";
			return client_code.join("\r");
		}
	}
}

XojoCodeGenerator.identifier = "com.xojo.PawExtensions.HTTPCodeGenerator";

XojoCodeGenerator.title = "Xojo Framework";

XojoCodeGenerator.fileExtension = "xojo_code";

registerCodeGenerator(XojoCodeGenerator);

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
