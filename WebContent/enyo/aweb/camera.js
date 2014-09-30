/**
 * Created by xtdhwl on 14-3-6.
 */


enyo.kind({
    name: "net.shenru.CameraPanel",
    style: "position: absolute;left: 0;top: 0;right: 0;bottom: 0;",
    classes: "enyo-fit",
    loadDelay: 500,
    components: [
        //image标签中的ondblclick和onclick事件可以起作用
        {name:"img", kind: 'enyo.Image' , onclick:"click", src: "assets/loading.gif",
            style: "width:320px; height:480px; background: rgb(255,0,0);"}
    ],
    click : function(){
        console.log("click");
//        if(this.job){
//            this.stop();
//        }else{
//            this.start();
//        }
        this.loading();
    },

    start: function () {
        //这里是enyo对定时器的封装
//        enyo.job(this.job, enyo.bind(this, "loading"), 5000)
        this.job = setInterval(enyo.bind(this, "loading"), this.loadDelay);
        console.log("start job : " + this.job)

    },

    stop: function () {
        clearInterval(this.job);
        this.job = undefined;
    },

    loading: function () {
        //刷新src
        console.log("loading");
        var url = 'http://' + location.host + '/AWeb/imageTask.png?&path=/sdcard/aweb/test.png&token='+localStorage.getItem("token")+'&t=' + Math.random();
        this.$.img.setSrc(url);
    }
});
