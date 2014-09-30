/**
 * Created by xtdhwl on 14-2-15.
 */


/**
 * http引擎
 */
enyo.kind({
    name: "net.shenru.HttpClient",
    published: {
        callback: null,
        inSender: null
    },
    setCallback: function (_inSender, _callback) {
    	this.inSender = _inSender;
        this.callback = _callback;
    },
    send: function (requestInfo) {
        var headerKey = new Array();
        var headerValue = new Array();
        //post添加头
        if (requestInfo.method.toLocaleUpperCase() == "POST") {
        	headerKey[headerKey.length] = "Content-type";
        	headerValue[headerValue.length] = "application/x-www-form-urlencoded";
        }
        //添加token
        var token = localStorage.getItem("token");
        if (token) {
        	headerKey[headerKey.length] = "token";
        	headerValue[headerValue.length] = token;
        }
        this.axhr = enyo.axhr.request({
            url: requestInfo.url,
            content: ("task=" + requestInfo.content),
            method: requestInfo.method,
            headerKeys: headerKey,
            headerValues: headerValue,
            callback: this.bindSafely("receive")
        });
    },
    receive: function (status, responseText) {
        if (this.callback) {
            var response = new net.shenru.Response();
            if (status == 200) {
                var json = JSON.parse(responseText);
                response.isException = json.isException;
                response.code = json.code;
                response.msg = json.msg;
                response.json = responseText;

                for (var i = 0; i < json.result.length; i++) {
                    console.log(json.result[i]);
                }
            } else {
                response.isException = true;
                response.code = -1;
                response.msg = "";
                response.json = null;
            }
            this.callback.apply(this.inSender, [this.inSender, response]);
        }
    }
    
});



/**
 * http响应
 */
enyo.kind({
    name: "net.shenru.Response",
    published: {
        isException: false,
        code: 0,
        msg: "",
        json: null,
        obj: null
    }
});

/**
 * http请求
 */
enyo.kind({
    name: "net.shenru.RequestInfo",
    published: {
        url: "",
        content: "",
        method: "POST"
    }
});

enyo.axhr = {
    request: function (inParams) {
        var xmlhttp;
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (inParams.callback) {
                    inParams.callback.apply(null, [xmlhttp.status, xmlhttp.responseText]);
                }
            }
        }
        //xmlhttp.send("task=" + content + " &token=" + token);
        xmlhttp.open(inParams.method, inParams.url, true);
        if(inParams.headerKeys){
        	 for (var i = 0; i < inParams.headerKeys.length; i++) {
                 var h = inParams.headerKeys[i];
                 var v = inParams.headerValues[i];
                 xmlhttp.setRequestHeader(h, v);
             }
        }
        xmlhttp.send(inParams.content);
    }
};



//------------------------------------------------------------------------
//send2: function (requestInfo) {
//    var xmlHttp = new net.shenru.Xmlhttp();
//    xmlHttp.url = requestInfo.url;
//    xmlHttp.method = requestInfo.method;
//    var cb = this.callback;
//    xmlHttp.callback = function (readyState, status, responseText) {
//        if (readyState == 4) {
//            var response = new net.shenru.Response();
//            if (status == 200) {
//                var json = JSON.parse(responseText);
//                response.isException = json.isException;
//                response.code = json.code;
//                response.msg = json.msg;
//                response.json = responseText;
//
//                for (var i = 0; i < json.result.length; i++) {
//                    console.log(json.result[i]);
//                }
//            } else {
//                response.isException = true;
//                response.code = -1;
//                response.msg = "";
//                response.json = null;
//            }
//            cb(response);
//        }
//    };
//    //post添加头
//    if ("post".toLowerCase() == xmlHttp.method.toLowerCase()) {
//        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//    }
//    //添加token
//    var token = localStorage.getItem("token");
//    if (token) {
//        xmlHttp.setRequestHeader("token", token);
//    }
//    xmlHttp.send("task=" + requestInfo.content);
//}
///**
// * 兼容性包装XMLHttpRequest
// */
//enyo.kind({
//    name: "net.shenru.Xmlhttp",
//    published: {
//        url: "",
//        method: "POST",
//        callback: null
//    },
//    headeres: [],
//    values: [],
//    setRequestHeader: function (header, value) {
//        this.headeres[this.headeres.length] = header;
//        this.values[this.values.length] = value;
//    },
//    onreadystatechange: function (callback) {
//        this.callback = callback;
//    },
//    send: function (content) {
//        var xmlhttp;
////        localStorage.setItem("callback", this.callback);
//        var cb = this.callback;
//        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
//            xmlhttp = new XMLHttpRequest();
//        } else {// code for IE6, IE5
//            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//        }
//        xmlhttp.onreadystatechange = function () {
//            console.log(headeres);
//            if (this.readyState == 4) {
//                if (cb) {
//                    cb(this.readyState, this.status, this.responseText);
//                }
//            }
//        };
//        xmlhttp.open(this.method, this.url, true);
//        for (var i = 0; i < this.headeres.length; i++) {
//            var h = this.headeres[i];
//            var v = this.values[i];
//            xmlhttp.setRequestHeader(h, v);
//        }
//        //xmlhttp.send("task=" + content + " &token=" + token);
//        xmlhttp.send(content);
//    },
//    donStatechange: function () {
//        if (this.callback) {
//            this.callback(this.readyState, this.status, this.responseText);
//        }
//    }
//});