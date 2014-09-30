///**
// *  Created by xtdhwl on 14-3-10.
// */

enyo.kind({
    name: "net.shenru.PicturePanel",
    kind: "Panels",
    classes: "panels-sample-flickr-panels enyo-unselectable enyo-fit",
    arrangerKind: "CollapsingArranger",
    components: [
        {layoutKind: "FittableRowsLayout", components: [
            {kind: "onyx.Toolbar", components: [
                {kind: "onyx.InputDecorator", style: "width: 90%;", layoutKind: "FittableColumnsLayout", components: [
                    {name: "searchInput", fit: true, kind: "onyx.Input", value: "AWeb", onchange: "search"},
                    {kind: "Image", src: "assets/search-input-search.png", style: "width: 20px; height: 20px;"}
                ]},
                {name: "searchSpinner", kind: "Image", src: "assets/spinner.gif", showing: false}
            ]},
            {kind: "List", fit: true, touch: true, onSetupItem: "setupItem", components: [
                {name: "item", style: "padding: 10px;", classes: "panels-sample-flickr-item enyo-border-box", ontap: "itemTap", components: [
                    {name: "thumbnail", kind: "Image", classes: "panels-sample-flickr-thumbnail"},
                    {name: "title", classes: "panels-sample-flickr-title"}
                ]},
                {name: "more", style: "background-color: #323232;", components: [
                    {kind: "onyx.Button", content: "more photos", classes: "onyx-dark panels-sample-flickr-more-button", ontap: "more"},
                    {name: "moreSpinner", kind: "Image", src: "assets/spinner.gif", classes: "panels-sample-flickr-more-spinner"}
                ]}
            ]}
        ]},
        {name: "pictureView", fit: true, kind: "FittableRows", classes: "enyo-fit panels-sample-flickr-main", components: [
            {name: "backToolbar", kind: "onyx.Toolbar", showing: false, components: [
                {kind: "onyx.Button", content: "Back", ontap: "showList"}
            ]},
            {fit: true, style: "position: relative;", components: [
                {name: "flickrImage", kind: "Image", classes: "enyo-fit panels-sample-flickr-center panels-sample-flickr-image", showing: false, onload: "imageLoaded", onerror: "imageLoaded"},
                {name: "imageSpinner", kind: "Image", src: "assets/spinner-large.gif", classes: "enyo-fit panels-sample-flickr-center", showing: false}
            ]}
        ]},
        {name: "flickrSearch", kind: "enyo.sample.PanelsFlickrSearch", onResults: "searchResults"}
    ],
    rendered: enyo.inherit(function (sup) {
        return function () {
            sup.apply(this, arguments);
            this.search();
        };
    }),
    reflow: enyo.inherit(function (sup) {
        return function () {
            sup.apply(this, arguments);
            var backShowing = this.$.backToolbar.showing;
            this.$.backToolbar.setShowing(enyo.Panels.isScreenNarrow());
            if (this.$.backToolbar.showing != backShowing) {
                this.$.pictureView.resized();
            }
        };
    }),
    search: function () {
        this.searchText = this.$.searchInput.getValue();
        this.page = 0;
        this.results = [];
        this.$.searchSpinner.show();
        this.$.flickrSearch.request(this.searchText);
    },
    searchResults: function (inSender, inResults) {
        this.$.searchSpinner.hide();
        this.$.moreSpinner.hide();
        this.results = this.results.concat(inResults);
//        this.$.list.setCount(this.results.length);
        this.$.list.setCount(Math.min(5,this.results.length));
        if (this.page === 0) {
            this.$.list.reset();
        } else {
            this.$.list.refresh();
        }
    },
    setupItem: function (inSender, inEvent) {
        var i = inEvent.index;
        var item = this.results[i];
        this.$.item.addRemoveClass("onyx-selected", inSender.isSelected(inEvent.index));
        this.$.thumbnail.setSrc(item.original);
        this.$.title.setContent(item.name);
        this.$.more.canGenerate = !this.results[i + 1];
        return true;
    },
    more: function () {
        this.page++;
        this.$.moreSpinner.show();
        this.$.flickrSearch.search(this.searchText, this.page);
    },
    itemTap: function (inSender, inEvent) {
        if (enyo.Panels.isScreenNarrow()) {
            this.setIndex(1);
        }
        this.$.imageSpinner.show();
        var item = this.results[inEvent.index];

        if (item.original == this.$.flickrImage.getSrc()) {
            this.imageLoaded();
        } else {
            this.$.flickrImage.hide();
            this.$.flickrImage.setSrc(item.original);
        }
    },
    imageLoaded: function () {
        var img = this.$.flickrImage;
        img.removeClass("tall");
        img.removeClass("wide");
        img.show();
        var b = img.getBounds();
        var r = b.height / b.width;
        if (r >= 1.25) {
            img.addClass("tall");
        } else if (r <= 0.8) {
            img.addClass("wide");
        }
        this.$.imageSpinner.hide();
    },
    showList: function () {
        this.setIndex(0);
    }
});

// A simple component to do a Flickr search.
enyo.kind({
    name: "enyo.sample.PanelsFlickrSearch",
    kind: "Component",
    published: {
        searchText: ""
    },
    events: {
        onResults: ""
    },
    url: "http://api.flickr.com/services/rest/",
    pageSize: 200,
    api_key: "2a21b46e58d207e4888e1ece0cb149a5",
    request: function (inSearchText, inPage) {
        //XXX
        var cs = new net.shenru.FileService();
        cs.setCallback(this, this.requestCallback);
        cs.getPictures();
//        this.test();
    },
    requestCallback: function (inSender, response) {
        console.log("requestCallback:" + response);
        if (response.isException) {
            // TODO 提示
            // show(response.msg);
        } else {
            inSender.doPicturesCallback(response.obj);
        }
    },
    doPicturesCallback: function (pictures) {
        for (var i=0, p; (p=pictures[i]); i++) {
            var url = "http://" + location.host + "/AWeb/imageTask.png?path=" + p.thumbnails + '&token=' + localStorage.getItem("token") + '&type=fit';
            p.original = this._URLencode(url);
        }
        this.doResults(pictures);
        return pictures;
    },
    processAjaxResponse: function (inSender, inResponse) {
        inResponse = JSON.parse(inResponse);
        this.processResponse(inSender, inResponse);
    },
    processResponse: function (inSender, inResponse) {
        var photos = inResponse.photos ? inResponse.photos.photo || [] : [];
        for (var i = 0, p; (p = photos[i]); i++) {
            var urlprefix = "http://farm" + p.farm + ".static.flickr.com/" + p.server + "/" + p.id + "_" + p.secret;
            p.thumbnail = urlprefix + "_s.jpg";
            p.original = urlprefix + ".jpg";
        }
        this.doResults(photos);
        return photos;
    },
    test : function(){
        var json = '{"taskId":1394462295337,"result":[' +
            '{"thumbnails":"/mnt/sdcard/DCIM/.thumbnails/1394262513970.jpg","name":"test1","dataId":1.0},' +
            '{"thumbnails":"/mnt/sdcard/DCIM/.thumbnails/1394262514543.jpg","name":"test2","dataId":2.0}],' +
            '"isException":false,"code":0,"msg":""}';
        var jsonObj = JSON.parse(json);
        var response = jsonObj;
        response.obj = jsonObj.result;
        this.doPicturesCallback(response.obj)
    },
    _URLencode: function(url){
        return encodeURI(url).replace(/\+/g, '%2B')/*.replace(/\"/g,'%22').replace(/\'/g, '%27').replace(/\//g,'%2F')*/;
    }
});

//
//enyo.kind({
//    name: "net.shenru.PicturePanel",
//    style: "position: absolute;left: 0;top: 0;right: 0;bottom: 0;",
//    classes: "enyo-fit",
//    mPictures : null,
//    components: [
//        { kind: "FittableColumns", style: "width:100%", classes: "onyx-toolbar onyx-toolbar-inline",
//            components: [
//                {
//                    kind: "onyx.InputDecorator",
//                    components: [
//                        {  kind: "onyx.Input", placeholder: "搜索文件", onkeyup: "inputChanged"  },
//                        { kind: "Image", src: "assets/search-input-search.png"  }
//                    ]
//                },
//                {  fit: true  },
//                {  kind: "onyx.Button", fit: true, content: "删除", ontap: "delecteClicker"  },
//                {  kind: "onyx.Button", content: "刷新", ontap: "refreshClicker" },
//                {  kind: "onyx.Button", content: "上传", ontap: "addFileClicker" },
//                {  kind: "onyx.Button", name: "downView", content: "下载", ontap: "downFileClicker" }
//            ]
//        },
//        {kind: "enyo.Scroller",horizontal: "hidden", fit: true, components: [
//            {name:"repeater", kind:"enyo.FlyweightRepeater", classes:"flyweight-repeater-sample-list",
//                onSetupItem: "setupItem",
//                components: [
//                    {name: "item", classes: "file-item",
//                        kind: "enyo.FittableColumns", components: [
//                        {name: "img", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
//                        {name: "name", content: "-", style: "width:5px"}
//                    ]}
//                ]
//            }
//        ]}
//    ],
//    handlers: {
//        onSelect: "itemSelected"
//    },
//    create: function () {
//        this.inherited(arguments);
////        this.refreshClicker(null, null);
//        this.test();
//    },
//    refreshClicker: function (inSender, inEvent) {
//        //获取所有的图片地址
//        var cs = new net.shenru.FileService();
//        cs.setCallback(this, this.refreshCallback);
//        cs.getPictures();
//    },
//    refreshCallback: function (inSender, response) {
//        console.log("refreshCallback:" + response);
//        if (response.isException) {
//            // TODO 提示
//            // show(response.msg);
//        } else {
//            inSender.doPicturesCallback(response.obj);
//        }
//    },
//    /**GridView item单点击事件:打开子目录*/
//    gridItemClicker: function (inSender, inEvent) {
//        var f = this.$.pictureGridView.getAdapter().getObject(inSender.selectPosition);
//    },
//    doPicturesCallback: function (pictures) {
//        //设置文件夹
////        var adapter = new MyAdapter();
////        adapter.setData(pictures);
////        this.$.pictureGridView.setAdapter(adapter);
//        this.mPictures = pictures;
//        for(var i = 0; i < pictures.obj.length; i++){
//            this.mPictures.obj[i].viewName =this.mPictures.obj[i].name;
//        }
//        this.$.repeater.setCount(pictures.obj.length);
//    },
//    setupItem: function(inSender, inEvent) {
//        var index = inEvent.index;
////        this.$.item.setContent((index+1) + ". " + this.people[index].name);
////        this.$.item.applyStyle("background", (inEvent.selected? "dodgerblue":"lightgray"));
//        var p = this.mPictures.obj[index];
//        this.$.name.setContent(p.viewName);
//        /* stop propogation */
//        return true;
//    },
//    itemSelected: function(inSender, inEvent) {
//        var index = inEvent.index;
//        var count = inEvent.flyweight.count;
////        if(index>=0 && index<count){
////            this.$.result.setContent(" [" + (index+1) + ". " + this.people[index].name + "] is selected");
////        }
//        this.log("index:" + index);
//        this.log("selectItem:" + this.$.repeater.getSelection());
//        this.mPictures.obj[index].viewName = "哈哈";
//        this.$.repeater.render();
//        return true;
//    },
//    test : function(){
//        var json = '{"taskId":1394462295337,"result":[' +
//            '{"thumbnails":"/mnt/sdcard/DCIM/.thumbnails/1394262513970.jpg","name":"test1","dataId":1.0},' +
//            '{"thumbnails":"/mnt/sdcard/DCIM/.thumbnails/1394262514543.jpg","name":"test2","dataId":2.0}],' +
//            '"isException":false,"code":0,"msg":""}';
//        var jsonObj = JSON.parse(json);
//        var response = jsonObj;
//        response.obj = jsonObj.result;
//        this.doPicturesCallback(response)
//    }
//});