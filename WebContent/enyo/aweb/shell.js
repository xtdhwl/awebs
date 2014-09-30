/**
 * Created by xtdhwl on 14-2-28.
 */

enyo.kind({
    name : "aweb.Shell",
//    statics : {
//        exec : function(vt100, cmd){
////            vt100(6)
//            //vt100.gotoState(6 /* STATE_PROMPT */);
//
//            var ss = new net.shenru.ShellService();
//            ss.setCallback(this, this.shellCallback);
//            ss.exec("ls")
//        }
//    },
    t : undefined,
    exec : function(t){
        console.log(t);
        this.t = t;
        //暂停
        this.t.gotoState(6 /*STATE_PROMPT*/);
        var ss = new net.shenru.ShellService();
        ss.setCallback(this, this.shellCallback);
        ss.exec(this.t.tokens.line)
    },

    shellCallback : function(inSender, response){
        console.log(response);
        this.t.gotoState(2);
        this.t.vt100(response.obj);
    },

    test : function(){
        //var  json = '{"taskId":0,"result":"config\r\ncache\r\nsdcard\r\nacct\r\nmnt\r\nvendor\r\nd\r\netc\r\nueventd.rc\r\nueventd.goldfish.rc\r\nsystem\r\nsys\r\nsbin\r\nproc\r\ninit.rc\r\ninit.goldfish.rc\r\ninit\r\ndefault.prop\r\ndata\r\nroot\r\ndev\r\nconfig\r\ncache\r\nsdcard\r\nacct\r\nmnt\r\nvendor\r\nd\r\netc\r\nueventd.rc\r\nueventd.goldfish.rc\r\nsystem\r\nsys\r\nsbin\r\nproc\r\ninit.rc\r\ninit.goldfish.rc\r\ninit\r\ndefault.prop\r\ndata\r\nroot\r\ndev\r\n","isException":false,"code":0,"msg":""}';
        var json = '{"taskId":0,"result":"config\\r\\ncache\\r\\nsdcard\\r\\nacct\\r\\nmnt\\r\\nvendor\\r\\nd\\r\\netc\\r\\nueventd.rc\\r\\nueventd.goldfish.rc\\r\\nsystem\\r\\nsys\\r\\nsbin\\r\\nproc\\r\\ninit.rc\\r\\ninit.goldfish.rc\\r\\ninit\\r\\ndefault.prop\\r\\ndata\\r\\nroot\\r\\ndev\\r\\nconfig\\r\\ncache\\r\\nsdcard\\r\\nacct\\r\\nmnt\\r\\nvendor\\r\\nd\\r\\netc\\r\\nueventd.rc\\r\\nueventd.goldfish.rc\\r\\nsystem\\r\\nsys\\r\\nsbin\\r\\nproc\\r\\ninit.rc\\r\\ninit.goldfish.rc\\r\\ninit\\r\\ndefault.prop\\r\\ndata\\r\\nroot\\r\\ndev\\r\\n","isException":false,"code":0,"msg":""}';
        var jsonObj = JSON.parse(json);
        t.vt100(jsonObj.result);
    }

});