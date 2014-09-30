/**
 * Created by xtdhwl on 14-2-26.
 */


/**
 *
 *
 * 自定义空间
 * 1:回调在定义事件events :{onItemTop : ""} //后面可以省略回调通知方法为this.doItemTop,在回调注意不要添加参数
 *   在监听方法可以通过inSender.selectPosition或getSelectPosition()来获取选择的位置
 *   在里说明在回调的时候通过自身属性找到需要的值而不是通过传递方式
 enyo.kind({
    name: "net.shenru.Main",
    create: function () {
        this.inherited(arguments);
        var jsonStr = '{"taskId":1393337891254,"result":{' +
            '"childs":[{"path":"/sdcard/aweb/6.txt","name":"6.txt","isDirectory":false,"lastModified":1.393338617E12,"length":11.0},' +
            '{"path":"/sdcard/aweb/5.txt","name":"5.txt","isDirectory":false,"lastModified":1.393338613E12,"length":11.0},' +
            '{"path":"/sdcard/aweb/4.txt","name":"4.txt","isDirectory":false,"lastModified":1.39333861E12,"length":11.0},' +
            '{"path":"/sdcard/aweb/3.txt","name":"3.txt","isDirectory":false,"lastModified":1.393338606E12,"length":11.0},' +
            '{"path":"/sdcard/aweb/2.txt","name":"2.txt","isDirectory":false,"lastModified":1.393338602E12,"length":11.0},' +
            '{"path":"/sdcard/aweb/1.txt","name":"1.txt","isDirectory":false,"lastModified":1.39333857E12,"length":11.0},' +
            '{"path":"/sdcard/aweb/test.txt","name":"test.txt","isDirectory":false,"lastModified":1.3928243E12,"length":11.0},' +
            '{"path":"/sdcard/aweb/test","name":"test","isDirectory":true,"lastModified":1.3928243E12,"length":0.0}],' +
            '"path":"/sdcard/aweb","name":"aweb","isDirectory":true,"lastModified":1.393338617E12,"length":0.0},"isException":false,"code":0,"msg":""}';
        var jsonObj = JSON.parse(jsonStr);
        var folderVo = jsonObj.result.childs;
        var adapter = new MyAdapter();
        adapter.setData(folderVo);
        this.$.fileGridView.setAdapter(adapter);
    },
    components: [
        {
            name: "fileGridView",
            kind: "GridView",
            onItemTop: "itemTop"
        }
    ],
    itemTop: function (inSender, inEvent) {
        //获取位置
        alert("itemTop position:" + inSender.selectPosition);
    }
});
 */
enyo.kind({
    name: "GridView",
    published: {
        adapter: null,
        numColumns: 0,
        columnWidth: 0,
        horizontalSpacing: 0,
        verticalSpacing: 0
    },
    events: {
        // 定义事件:点击Item事件
        onItemTop: "",
        onItemDblClick: ""
    },
    selectPosition: -1,
    //回调标志
    _itemTopFlag: 0,
    _itemTopPosition: -1,
//    handlers:{
//      ontap:"itemTap"
//    },
    components: [
        {
            name: "list",
            kind: "enyo.List",
            multiSelect: true,
            onSetupItem: "setupItem",
            //TODO 这里不设置样式在外面设置无效
            style: " height:100%;",
            components: [
                {
                    kind: "enyo.FittableColumns", components: [
                    {name: "item0", showing: false, position: 0, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image0", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name0", content: "-", style: "width:5px"}
                    ]},
                    {name: "item1", showing: false, position: 1, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image1", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name1", content: "-", classes: "file-text-item"}
                    ]},
                    {name: "item2", showing: false, position: 2, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image2", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name2", content: "-", classes: "file-text-item"}
                    ]},
                    {name: "item3", showing: false, position: 3, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image3", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name3", content: "-", classes: "file-text-item"}
                    ]},
                    {name: "item4", showing: false, position: 4, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image4", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name4", content: "-", classes: "file-text-item"}
                    ]},
                    {name: "item5", showing: false, position: 5, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image5", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name5", content: "-", classes: "file-text-item"}
                    ]}
                ]
                }
            ]
        }
    ],

    setAdapter: function (data) {
        this.adapter = data;
        var col = this.numColumns > 0 ? this.numColumns : 5;
        this.numColumns = col;
        var size = Math.floor(this.adapter.getCount() / this.numColumns) + (this.adapter.getCount() % this.numColumns > 0 ? 1 : 0);
        this.$.list.setCount(size);
        this.$.list.refresh();
    },

    setupItem: function (inSender, inEvent) {
        //TODO 这里应该为this.adapter.getView()
        for (var i = 0; i < this.numColumns; i++) {
            var item = this.$["item" + i];
            item.setShowing(false);
        }
        var c = this.adapter.getCount() - inEvent.index * this.numColumns;
        for (var i = 0; i < this.numColumns && i < c; i++) {
            var p = inEvent.index * this.numColumns + i;
            var item = this.$["item" + i];
            var name = this.$["name" + i];
            var image = this.$["image" + i];
            item.setShowing(true);
            var obj = this.adapter.getObject(p);
            item.position = i;
            name.setContent(obj.name);
            image.setSrc(obj.isDirectory ? "assets/fm_icon_folder.png" : "assets/fm_icon_file.png");
        }

        if (this._itemTopFlag != 0) {
            var flag = this._itemTopFlag;
            this._itemTopFlag = 0;
            this.selectPosition = inEvent.index * this.numColumns + this._itemTopPosition;
            //这里的回调不能添加参数
            if (flag == 1) {
                this.doItemTop();
            } else if (flag == 2) {
                this.doItemDblClick();
            }
        }
    },

    itemTap: function (inSender, inEvent) {
        //回调思路由于item每次需要渲染所以不能确定位置，由于javaScript是线程安全的所以可以通过标志位回调方式
        //在每次渲染的时候查看回调标志位
        this._itemTopFlag = 1;
        this._itemTopPosition = inSender.position;
    },
    itemDblclick: function (inSender, inEvent) {
        this._itemTopFlag = 2;
        this._itemTopPosition = inSender.position;
    }
});

/**
 * 图片GridView
 */

enyo.kind({
    name: "PictureGridView",
    published: {
        adapter: null,
        numColumns: 0,
        columnWidth: 0,
        horizontalSpacing: 0,
        verticalSpacing: 0
    },
    events: {
        // 定义事件:点击Item事件
        onItemTop: "",
        onItemDblClick: ""
    },
    selectPosition: -1,
    //回调标志
    _itemTopFlag: 0,
    _itemTopPosition: -1,
//    handlers:{
//      ontap:"itemTap"
//    },
    components: [
        {
            name: "list",
            kind: "enyo.List",
            multiSelect: true,
            onSetupItem: "setupItem",
            //TODO 这里不设置样式在外面设置无效
            style: " height:100%;",
            components: [
                {
                    kind: "enyo.FittableColumns", components: [
                    {name: "item0", showing: false, position: 0, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image0", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name0", content: "-", style: "width:5px"}
                    ]},
                    {name: "item1", showing: false, position: 1, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image1", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name1", content: "-", classes: "file-text-item"}
                    ]},
                    {name: "item2", showing: false, position: 2, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image2", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name2", content: "-", classes: "file-text-item"}
                    ]},
                    {name: "item3", showing: false, position: 3, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image3", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name3", content: "-", classes: "file-text-item"}
                    ]},
                    {name: "item4", showing: false, position: 4, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image4", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name4", content: "-", classes: "file-text-item"}
                    ]},
                    {name: "item5", showing: false, position: 5, ontap: "itemTap", onhold: "itemDblclick", classes: "file-item",
                        kind: "enyo.FittableRows", components: [
                        {name: "image5", kind: "enyo.Image", src: "assets/fm_icon_file.png", classes: "file-image-item"},
                        {name: "name5", content: "-", classes: "file-text-item"}
                    ]}
                ]
                }
            ]
        }
    ],

    setAdapter: function (data) {
        this.adapter = data;
        var col = this.numColumns > 0 ? this.numColumns : 5;
        this.numColumns = col;
        var size = Math.floor(this.adapter.getCount() / this.numColumns) + (this.adapter.getCount() % this.numColumns > 0 ? 1 : 0);
        this.$.list.setCount(size);
        this.$.list.refresh();
    },

    setupItem: function (inSender, inEvent) {
        //TODO 这里应该为this.adapter.getView()
        for (var i = 0; i < this.numColumns; i++) {
            var item = this.$["item" + i];
            item.setShowing(false);
        }
        var c = this.adapter.getCount() - inEvent.index * this.numColumns;
        for (var i = 0; i < this.numColumns && i < c; i++) {
            var p = inEvent.index * this.numColumns + i;
            var item = this.$["item" + i];
            var name = this.$["name" + i];
            var image = this.$["image" + i];
            item.setShowing(true);
            var obj = this.adapter.getObject(p);
            item.position = i;
            name.setContent(obj.name);
            //http://aweb.com/imageTask.png?size="320*480"&path="camear"&type="fit"
            var url = "http://" + location.host + "/AWeb/imageTask.png?t=" + Math.random()
                + '&path=' + obj.thumbnails + '&token=' + localStorage.getItem("token") + '&type=fit';
//            image.setSrc(this._URLencode(url));
            image.setSrc("assets/fm_icon_image.png");
            image.url =this._URLencode(url);
        }

        if (this._itemTopFlag != 0) {
            var flag = this._itemTopFlag;
            this._itemTopFlag = 0;
            this.selectPosition = inEvent.index * this.numColumns + this._itemTopPosition;
            //这里的回调不能添加参数
            if (flag == 1) {
                this.doItemTop();
            } else if (flag == 2) {
                this.doItemDblClick();
            }
        }
    },
    /**
     * 转化url
     * @param url
     * @returns {XML|string}
     */
    _URLencode: function(url){
        return encodeURI(url).replace(/\+/g, '%2B')/*.replace(/\"/g,'%22').replace(/\'/g, '%27').replace(/\//g,'%2F')*/;
    },

    itemTap: function (inSender, inEvent) {
        //回调思路由于item每次需要渲染所以不能确定位置，由于javaScript是线程安全的所以可以通过标志位回调方式
        //在每次渲染的时候查看回调标志位
        this._itemTopFlag = 1;
        this._itemTopPosition = inSender.position;
    },
    itemDblclick: function (inSender, inEvent) {
        this._itemTopFlag = 2;
        this._itemTopPosition = inSender.position;

        if(inEvent.originator instanceof  enyo.Image){
            inEvent.originator.setSrc(inEvent.originator.url);
            inEvent.originator.render();
        }

//        inSender.$["image" + inSender.position].setSrc(inSender.url);
    }
});


/**
 * 数据源
 */
enyo.kind({
    name: "BaseAdapter",
    published: {
        data: null
    },

    getCount: function () {
        return this.data.length;
    },

    getObject: function (position) {
        return this.data[position];
    },

    getView: function (position) {
        return null;
    }
})