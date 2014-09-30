/**
 * Created by xtdhwl on 14-2-15.
 */
// 服务
//TODO 在回调中应该添加request response
/**
 * 通讯录服务
 */
enyo.kind({
    name: "net.shenru.ContactService",
    kind: "net.shenru.BaseService",
    // delectContact : function(contact) {
    // var httpClient = new net.shenru.HttpClient();
    // var requestInfo = new net.shenru.RequestInfo();
    // requestInfo.url = this.getTaskUrl();
    // requestInfo.content = "";
    // httpClient.setCallback(this, function(response) {
    // this.callback(this.inSender, response);
    // });
    // httpClient.send(requestInfo);
    // },

    /**
     * 获取所有通讯录
     *
     * @param contact
     */
    getContacts: function () {
        var task = this.createTask(this.AWEB);
        task.method = "getContacts";
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._getContactsCallback);
        httpClient.send(requestInfo);
    },
    _getContactsCallback: function (inSender, response) {
        if (this.callback) {
            var contacts = new Array();
            // {"mobile":"18888888888","name":"shenru","id":119}
            if (!response.isException) {
                var json = JSON.parse(response.json);
                console.log(json);
                for (var i = 0; i < json.result.length; i++) {
                    contacts[i] = json.result[i];
                }
                response.obj = contacts;
            }
            this.callback.apply(this.inSender, [ this.inSender, response ]);
        }
    },

    /**
     * 添加联系人回调
     */
    addContact: function (contact) {
        var task = this.createTask(this.AWEB);
        task.method = "addContacts";
        task.taskContent = contact;
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._getContactsCallback);
        httpClient.send(requestInfo);
    },
    _addContactCallback: function (inSender, response) {
        if (this.callback) {
            this.callback.apply(this.inSender, [ this.inSender, response ]);
        }
    },
    /**
     * 更新联系人
     */
    updateContact: function () {

    },
    _updateContactCallback: function (inSender, response) {

    },
    /**
     * 删除联系人
     */
    deleteContact: function () {

    },
    _deleteContactCallback: function (inSender, response) {

    }

});

/**
 * 电话服务
 */
enyo.kind({
    name: "net.shenru.TelephoneService",
    kind: "net.shenru.BaseService",
    /**
     * 呼叫
     */
    callPhone: function (phone) {
        var task = this.createTask(this.AWEB);
        task.method = "callPhone";
        task.taskContent = {
            "telephone": phone
        };
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._getContactsCallback);
        httpClient.send(requestInfo);
    },
    _callPhoneCallback: function (inSender, response) {
        if (this.callback) {
            this.callback.apply(this.inSender, [ this.inSender, response ]);
        }
    }
});


/**
 * FileService文件服务
 */
enyo.kind({
    name: "net.shenru.FileService",
    kind: "net.shenru.BaseService",
    /**
     * 下载文件
     * @param path
     */
    getFile: function (file) {
        var task = this.createTask(this.AWEB);
        task.method = "getFile";
        task.taskContent = {
            "path": file
        };
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._getFolderCallback);
        httpClient.send(requestInfo);
    },
    _getFilCallback: function (inSender, response) {

    },

    /**
     * 获取目录
     */
    getFolder: function (path) {
        var task = this.createTask(this.AWEB);
        task.method = "getFolder";
        task.taskContent = {
            "path": path
        };
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._getFolderCallback);
        httpClient.send(requestInfo);
    },
    _getFolderCallback: function (inSender, response) {
//        "result":{"childs":[{"path":"/dev","name":"dev","isDirectory":false,"lastModified":1393395663000,"length":0},
//            {"path":"/root","name":"root","isDirectory":false,"lastModified":1315497727000,"length":0},
//            {"path":"/data","name":"data","isDirectory":false,"lastModified":1393395663000,"length":0}],
//              "path":"/","name":"","isDirectory":true,"lastModified":1393395662000,"length":0}

        if (this.callback) {
            var files = new Array();
            if (!response.isException) {
                var json = JSON.parse(response.json);
                response.obj = json.result;
            }
            this.callback.apply(this.inSender, [ this.inSender, response ]);
        }
    },

    /**
     * 获取相册图片
     */
    getPictures: function () {
        var task = this.createTask(this.AWEB);
        task.method = "getPictures";
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._getPicturesCallback);
        httpClient.send(requestInfo);
    },
    _getPicturesCallback: function (inSender, response) {
//        {"taskId":1394462295337,"result":[
//            {"thumbnails":"/mnt/sdcard/DCIM/.thumbnails/1394262513970.jpg","dataId":1.0},
//            {"thumbnails":"/mnt/sdcard/DCIM/.thumbnails/1394262514543.jpg","dataId":2.0}],
//            "isException":false,"code":0,"msg":""}
        if (this.callback) {
            var files = new Array();
            if (!response.isException) {
                var json = JSON.parse(response.json);
                response.obj = json.result;
            }
            this.callback.apply(this.inSender, [ this.inSender, response ]);
        }
    }
});

/**
 * shell服务
 */

enyo.kind({
    name: "net.shenru.ShellService",
    kind: "net.shenru.BaseService",

    /**
     * 执行命令
     */
    exec: function (cmd) {
        var task = this.createTask(this.CMD);
        task.method = "shell";
        task.taskContent = {
            "content": cmd
        };
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._execCallback);
        httpClient.send(requestInfo);
    },
    _execCallback: function (inSender, response) {
        /*
         {"taskId":0,"result":"
         config\ncache\nsdcard\nacct\nmnt\nvendor\nd\netc\nueventd.rc\nueventd.goldfish.rc\nsystem\nsys\n
         sbin\nproc\ninit.rc\ninit.goldfish.rc\ninit\ndefault.prop\ndata\nroot\ndev\nconfig\ncache\nsdcard\n
         acct\nmnt\nvendor\nd\netc\nueventd.rc\nueventd.goldfish.rc\nsystem\nsys\nsbin\nproc\ninit.rc\n
         init.goldfish.rc\ninit\ndefault.prop\ndata\nroot\ndev\n","isException":false,"code":0,"msg":""}"
         */
        //replace(/#/, shellStr);
        var j = response.json;
        console.log(j);
        response.json = j.replace(/\\n/g, "\\r\\n");
        console.log(response.json);
        if (this.callback) {
            if (!response.isException) {
                var json = JSON.parse(response.json);
                response.obj = json.result;
            }
            this.callback.apply(this.inSender, [ this.inSender, response ]);
        }
    }
});

/**
 * LocationService 位置服务
 */

enyo.kind({
    name: "net.shenru.LocationService",
    kind: "net.shenru.BaseService",

    /**
     * 获取当前位置
     */
    getLocation: function (cmd) {
        var task = this.createTask(this.CMD);
        task.method = "getLocation";
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._getLocationCallback);
        httpClient.send(requestInfo);
    },
    _getLocationCallback: function (inSender, response) {
        /*
         {"taskId":0,"result":{lng:Number, lat:Number,time:"",type:"","mark":""},"isException":false,"code":0,"msg":""}"
         */
        //replace(/#/, shellStr);
        var j = response.json;
        console.log(j);
        response.json = j.replace(/\\n/g, "\\r\\n");
        console.log(response.json);
        if (this.callback) {
            if (!response.isException) {
                var json = JSON.parse(response.json);
                response.obj = json.result;
            }
            this.callback.apply(this.inSender, [ this.inSender, response ]);
        }
    },

    /**
     * 查询指定时间位置,行程轨迹
     */
    getLocus: function (startTime, endTime) {
        var task = this.createTask(this.AWEB);
        task.method = "getLocus";
        task.taskContent = {
            "start": startTime,
            "end" : endTime
        };
        var httpClient = new net.shenru.HttpClient();
        var requestInfo = new net.shenru.RequestInfo();
        requestInfo.url = this.getTaskUrl();
        requestInfo.content = task.getJson();
        httpClient.setCallback(this, this._getLocusCallback);
        httpClient.send(requestInfo);
    },
    _getLocusCallback: function (inSender, response) {
//        {"taskId":1394640749821,"result":[
//            {"type":"gps","mark":"这是测试数据","lng":116.404197,"lat":39.914963,"time":1.00009993393E11,"id":0.0}],
//            "isException":false,"code":0,"msg":""}
        console.log(response.json);
        if (this.callback) {
            if (!response.isException) {
                var json = JSON.parse(response.json);
                response.obj = json.result;
            }
            this.callback.apply(this.inSender, [ this.inSender, response ]);
        }
    }
});

//=============================================================================================
enyo.kind({
    name: "net.shenru.Task",
    published: {
        id: 0,
        type: "",
        isResponse: true,
        method: "",
        taskContent: {}
    },
    getJson: function () {
        // var json = "{\"id\":\"" + this.id + "\",\"type\":\"" + this.type
        // + "\",\"isResponse\":\"" + this.isResponse + "\",\"method\":\""
        // + this.method + "\",\"taskContent\":{" + this.taskContent
        // + "}}";
        var json = {
            "id": this.id,
            "type": this.type,
            "isResponse": this.isResponse,
            "method": this.method,
            "taskContent": this.taskContent
        };
        return JSON.stringify(json);
    }
})


/**
 * Base服务
 */
enyo.kind({
    name: "net.shenru.BaseService",
    published: {
        /** 回调 */
        AWEB: "AWEB",
        CMD: "CMD",
        callback: null,
        inSender: null
    },
    setCallback: function (_inSender, _callback) {
        this.inSender = _inSender;
        this.callback = _callback;
    },
    getBaseUrl: function () {
    },
    getTaskUrl: function () {
        var url = "http://" + location.host + "/AWeb/sendTask?t="
            + Math.random();
        return url;
    },
    createTask: function (type) {
        var task = new net.shenru.Task();
        task.id = 0;
        task.type = type ? type : this.AWEB;
        this.isResponse = true;
        return task;
    }
})

// requestContact: function (token) {
// var url = "http://192.168.1.108:8080/AWeb/sendTask?t=" + Math.random();
// var task =
// "{id:1,type:'AWEB',isResponse:true,method:'getContacts',taskContent:{}}";
// var xmlhttp;
// if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
// xmlhttp = new XMLHttpRequest();
// } else {// code for IE6, IE5
// xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
// }
// xmlhttp.onreadystatechange = function () {
// if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
// //alert(xmlhttp.responseText);
// console.log(xmlhttp.responseText);
// doContactCallback(xmlhttp.responseText);
// }
// }
// xmlhttp.open("POST", url, true);
// xmlhttp.setRequestHeader("Content-type",
// "application/x-www-form-urlencoded");
// xmlhttp.setRequestHeader("token", token);
// //xmlhttp.send("task=" + content + " &token=" + token);
// xmlhttp.send("task=" + task);
// }

