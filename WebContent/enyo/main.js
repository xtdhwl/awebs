/**
 * Created by xtdhwl on 14-1-26.
 */
enyo.path.addPaths({
    layout: "lib/layout/",
    onyx: "lib/onyx/",
    onyx: "lib/onyx/source/",
    g11n: "lib/g11n/",
    canvas: "lib/canvas/",
    panel: "panel/"
});
enyo.depends(
// TODO 导入js失败在html导包
    "service.js");
// =================================================================================================
// 联系人展示view
enyo.kind({
    name: "net.shenru.Contact",
    style: "padding:40px",
    components: [
        {
            kind: "FittableColumns",
            components: [
                {
                    name: "headerView",
                    kind: "enyo.Image",
                    style: "width:60px; height:60px"
                },
                {
                    name: "nameView",
                    content: "姓名",
                    style: "padding:20px"
                }
            ]
        },
        {
            content: "<hr>",
            style: "padding-top:20px;padding-bottom:20px",
            allowHtml: true
        },
        {
            kind: "FittableColumns",
            components: [
                {
                    name: "mobileView",
                    kind: "onyx.Button",
                    content: "电话"
                },
                {
                    name: "smsView",
                    kind: "onyx.Button",
                    ontap: "sms",
                    style: " margin-left:40px",
                    content: "发送短息"
                },
                {
                    name: "callView",
                    kind: "onyx.Button",
                    ontap: "callClicker",
                    style: " margin-left:40px",
                    content: "呼叫"
                }
            ]
        }
    ],
    setContact: function (contact) {
        this.$.nameView.setContent(contact.name);
        this.$.mobileView.setContent(contact.mobile);
    },
    callClicker: function () {
        if (this.$.mobileView.content) {
            var cs = new net.shenru.TelephoneService();
            // TODO 这里写的不优雅
            cs.setCallback(this, this.callPhoneCallback);
            cs.callPhone(this.$.mobileView.content);
        } else {
            alert("电话无效");
        }
    },
    callPhoneCallback: function (inSender, response) {
        if (response.isException) {
            // TODO 提示
            // show(response.msg);
        } else {
            // 呼叫成功
        }
    },
    sms: function () {
        alert("sms:" + this.$.mobileView.content);
    }

});

enyo
    .kind({
        name: "net.shenru.AddContact",
        style: "padding:40px; width:80%",
        components: [
            {
                kind: "FittableRows", /* style:"background:#890", */
                components: [
                    // TODO 换行问题
                    {
                        kind: "FittableColumns",
                        components: [
                            {
                                kind: "enyo.Image",
                                style: "width:60px; height:60px"
                            },
                            {
                                kind: "onyx.Input",
                                name: "name",
                                style: "margin:20px",
                                placeholder: "姓名",
                                fit: true
                            }
                        ]
                    },
                    {
                        kind: "FittableColumns",
                        style: "margin-top:40px",
                        components: [
                            {
                                kind: "onyx.Input",
                                name: "mobile",
                                style: "border: 1px solid silver; background:#888; height:25px",
                                fit: true,
                                placeholder: "手机"
                            }
                        ]
                    },
                    {
                        kind: "FittableColumns",
                        style: "margin-top:40px",
                        components: [
                            {
                                kind: "onyx.Input",
                                style: "border: 1px solid silver; background:#888; height:25px",
                                fit: true,
                                placeholder: "座机"
                            }
                        ]
                    },
                    {
                        kind: "FittableColumns",
                        style: "margin-top:40px",
                        components: [
                            {
                                kind: "onyx.Input",
                                style: "border: 1px solid silver; background:#888; height:25px",
                                fit: true,
                                placeholder: "家庭"
                            }
                        ]
                    },
                    {
                        kind: "FittableColumns",
                        style: "margin-top:40px",
                        components: [
                            {
                                kind: "onyx.Input",
                                style: "border: 1px solid silver; background:#888; height:25px",
                                fit: true,
                                placeholder: "主页"
                            }
                        ]
                    },
                    {
                        kind: "FittableColumns",
                        style: "margin-top:40px",
                        components: [
                            {
                                kind: "onyx.Input",
                                style: "border: 1px solid silver; background:#888; height:25px",
                                fit: true,
                                placeholder: "备注"
                            }
                        ]
                    },
                    {
                        kind: "FittableColumns",
                        style: "margin-top:40px",
                        components: [
                            {
                                kind: "onyx.Button",
                                content: "取消",
                                ontap: "cancelTap"
                            },
                            {
                                fit: true
                            },
                            {
                                kind: "onyx.Button",
                                content: "确定",
                                ontap: "confirmClicker"
                            }
                        ]
                    }
                ]
            }
        ],
        cancelTap: function (inSender, inEvent) {
            console.log("net.shenru.AddContact cancelTap");
            this.setShowing(false);
        },
        confirmClicker: function (inSender, inEvent) {
            var name = this.$.name.value;
            var mobile = this.$.mobile.value;
            var contact = {
                "name": name,
                "mobile": mobile
            };
            var cs = new net.shenru.ContactService();
            // TODO 这里写的不优雅
            cs.setCallback(this, this.addContactCallback);
            cs.addContact(contact);
        },
        addContactCallback: function (inSender, response) {
            if (response.isException) {
                // TODO 提示
                // show(response.msg);
            } else {
                this.setShowing(false);
            }
        },
        /**
         * 是否在编辑中
         */
        isEditingg: function () {
            return true;
        }
    });
// 联系人
enyo
    .kind({
        name: "net.shenru.ContactPanel",
        kind: "FittableRows",
        style: "position: absolute;left: 0;top: 0;right: 0;bottom: 0;",
        classes: "enyo-fit",

        handlers: {
            onSelect: "itemSelected"
        },
        components: [
            {
                kind: "FittableColumns", style: "width:100%", classes: "onyx-toolbar onyx-toolbar-inline",
                components: [
                    {
                        kind: "onyx.InputDecorator",
                        components: [
                            {
                                kind: "onyx.Input",
                                placeholder: "搜索联系人", /*
                             * onchange:
                             * "inputChanged",
                             */
                                onkeyup: "inputChanged"
                            },
                            {
                                kind: "Image",
                                src: "assets/search-input-search.png"
                            }
                        ]
                    },
                    {
                        fit: true
                    },
                    {
                        kind: "onyx.Button", fit: true, content: "删除", ontap: "delecteClicker"
                    },
                    {
                        kind: "onyx.Button", content: "刷新", ontap: "refreshClicker"
                    },
                    {
                        kind: "onyx.Button", content: "添加联系人", ontap: "addContact"
                    }
                ]
            },
            {
                kind: "FittableColumns",
                style: "height: 100%",
                components: [
                    {
                        components: [
                            // background", (inEvent.selected ?
                            // "dodgerblue" : "lightgray"
                            // 笔记:list要设置enyo-fit属性不然会出现没有滚动条
                            {
                                name: "list", kind: "enyo.List", onSetupItem: "setupItem",
                                style: "width:20%;height:100 %; background:lightgray;",
                                classes: "enyo-unselectable  enyo-fit",
                                components: [
                                    {
                                        name: "item",
                                        content: "item",
                                        ontap: "itemTap",
                                        classes: "list-item"
                                    }
                                ]
                            }
                            /*
                             * {kind: "onyx.Spinner",
                             * style:"z-index:-1"}
                             */
                        ]
                    },

                    {
                        style: "position:relative; left:20%",
                        fit: true,
                        components: [
                            // TODO 显示联系人问题
                            // {content: "点击左侧联系人查看详情", showing: true },
                            {
                                name: "contactView",
                                kind: "net.shenru.Contact",
                                showing: false,
                                fit: true
                            },
                            {
                                name: "addContactView",
                                kind: "net.shenru.AddContact",
                                showing: true,
                                fit: true
                            }
                        ]
                    }
                ]
            }
        ],
        contacts: [],
        contactsSearch: null,
        create: function () {
            // create is called *after* the constructor chain is finished
            this.inherited(arguments);
            this.refreshClicker(null, null);
        },
        // TODO rendered方法的作用复写后list的item渲染不出来
        destroy: function () {
            // do inherited teardown
            this.inherited(arguments);
            console.log("destroy");
        },
        inputChanged: function (inSender, inEvent) {
            console.log("inputChanged:" + inSender.getValue());
            var value = inSender.getValue();
            if (!this.contactsSearch) {
                this.contactsSearch = new Array();
                for (var i = 0; i < this.contacts.length; i++) {
                    var c = this.contacts[i];
                    this.contactsSearch[i] = c;
                }
            }

            this.contacts = new Array();
            for (var i = 0; i < this.contactsSearch.length; i++) {
                var c = this.contactsSearch[i];
                // 正则表达式
                // value = ""
                //
                var patt1 = new RegExp(value);
                if (patt1.test(c.name) || (value == "")) {
                    this.contacts[this.contacts.length] = c;
                }
            }
            this.$.list.setCount(this.contacts.length);
            this.$.list.reset();
        },
        delecteClicker: function (inSender, inEvent) {
            var index = this.$.list.getSelection().lastSelected;
            var contact = this.contacts[index];
            if (contact) {
                alert("删除联系人");
            } else {
                alert("请选择联系人");
            }
        },
        refreshClicker: function (inSender, inEvent) {
            var cs = new net.shenru.ContactService();
            // TODO 这里写的不优雅
            cs.setCallback(this, this.refreshCallback);
            cs.getContacts();
        },
        refreshCallback: function (inSender, response) {
            if (response.isException) {
                // TODO 提示
                // show(response.msg);
            } else {
                inSender.doContactCallback(response.obj);
            }
        },
        doContactCallback: function (contacts) {
            this.contacts = contacts;
            this.$.list.setCount(contacts.length);
            this.$.list.reset();
        },
        // 自定义方法调用方式为this.requestContact();
        requestContact: function (token) {
            var cs = new net.shenru.ContactService();
            cs.setCallback(this.contactsCallback);
            cs.getContacts();
        },
        contactsCallback: function (contacts) {
            // TODO 获取联系人回调
            console.log(contacts);
        },
        itemTap: function (inSender, inEvent) {
            // alert("itemTap");
            var node = inEvent.originator;

        },
        setupItem: function (inSender, inEvent) {
            // onSetupItem是item每次渲染是回调
            console.log("setupItem");
            var index = inEvent.index;
            var contact = this.contacts[index];
            this.$.item.setContent(contact.name);
            this.$.item.applyStyle("background",
                (inEvent.selected ? "dodgerblue" : "lightgray"));
            /* stop propogation */
            return true;
        },

        // 列表被点击
        itemSelected: function (inSender, inEvent) {
            console.log("list select index:" + inEvent.index);
            // TODO 判断是否在编辑
            if (this.$.addContactView.isEditingg()) {

            }

            var index = inEvent.index;
            var contact = this.contacts[index];
            this.$.contactView.setContact(contact);
            this.$.contactView.setShowing(true);
            this.$.addContactView.setShowing(false);
            return true;
        },

        // 添加联系人
        addContact: function (inSender, inEvent) {
            console.log("addContact");
            this.$.contactView.setShowing(false);
            this.$.addContactView.setShowing(true);
        },
        refresh: function (inSender, inEvent) {
            console.log("refresh event");

            var xmlhttp;
            if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome,
                // Opera, Safari
                xmlhttp = new XMLHttpRequest();
            } else {// code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function () {

                console.log("error:" + xmlhttp.error);
                console.log("readyState:" + xmlhttp.readyState);
                console.log("status:" + xmlhttp.status);
                console.log("responseText:" + xmlhttp.responseText);
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    document.getElementById("myDiv").innerHTML = xmlhttp.responseText;
                }
            }
            xmlhttp.open("POST",
                "http://127.0.0.1:8080/ShenruWeb/notelist.html", true);
            xmlhttp.send();
        },
        processResponse: function (e, t) {
            this.$.textArea.setValue(JSON.stringify(t, null, 2));
        },
        processError: function (e, t) {
            alert("Error!");
        }

    });

enyo.kind({

    kind: "FittableRows",
    classes: "enyo-fit",
    components: [
        {
            kind: "FittableColumns",
            classes: "onyx-toolbar",
            components: [
                {
                    components: [
                        {
                            classes: "onyx-toolbar-inline",
                            style: "white-space: nowrap;",
                            components: [
                                {
                                    kind: "onyx.InputDecorator",
                                    style: "width: 60px;",
                                    components: [
                                        {
                                            kind: "onyx.Input",
                                            value: 0,
                                            onchange: "gotoPanel"
                                        }
                                    ]
                                },
                                {
                                    kind: "onyx.Button",
                                    content: "Go",
                                    ontap: "gotoPanel"
                                },
                                {
                                    kind: "onyx.Button",
                                    content: "Add",
                                    ontap: "addPanel"
                                },
                                {
                                    kind: "onyx.Button",
                                    content: "Delete",
                                    ontap: "deletePanel"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
// =================================================================================================
// --------------------------------------------------------------------------------------------
// view
// 主界面功能导航
// 自定义控件：TreeView
enyo.kind({
    name: "TreeView",
    kind: "FittableRows",

    published: {
        // 选中节点的主节点
        selectElementTitle: "",
        // 选中节点的内容
        selectElementContent: ""
    },
    events: {
        // 定义事件:点击Item事件
        onItemTop: "itemTop"
    },
    components: [
        {
            kind: "Selection",
            onSelect: "select",
            onDeselect: "deselect"
        },
        {
            kind: "Scroller",
            components: [
                {
                    kind: "Node",
                    content: "AWeb",
                    expandable: false,
                    expanded: true,
                    onNodeTap: "nodeTapEvent",
                    components: [
                        // TODO node on select?
                        // TODO 功能modle[title:标题,subTitle:子功能标题,sub:子功能]
                        {
                            content: "-----",
                            expandable: false,
                            expanded: true,
                            components: [
                                {
                                    content: "联系人"
                                },
                                {
                                    content: "消息"
                                },
                                {
                                    content: "通话记录"
                                }
                            ]
                        },
                        {
                            content: "-----",
                            expandable: false,
                            expanded: true,
                            components: [
                                {
                                    content: "文件浏览器"
                                },
                                {
                                    content: "图片浏览器"
                                }
                            ]
                        },
                        {
                            content: "-----",
                            expandable: false,
                            expanded: true,
                            components: [
                                {
                                    content: "摄像头"
                                },
                                {
                                    content: "麦克风"
                                }
                            ]
                        },
                        {
                            content: "-----",
                            expandable: false,
                            expanded: true,
                            components: [
                                {
                                    content: "手机定位"
                                },
                                {
                                    content: "手机报警"
                                }
                            ]
                        },
                        {
                            content: "-----",
                            expandable: false,
                            expanded: true,
                            components: [
                                {
                                    content: "Toolbox"
                                },
                                {
                                    content: "CMD"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    nodeTapEvent: function (inSender, inEvent) {
        var node = inEvent.originator;
        this.$.selection.select(node.id, node);
        this.selectElementContent = node.content;
        this.doItemTop();
    },
    select: function (inSender, inEvent) {
        inEvent.data.$.caption.applyStyle("background-color", "lightblue");
    },
    deselect: function (inSender, inEvent) {
        inEvent.data.$.caption.applyStyle("background-color", null);
    }
});

// 主界面stack
// push pop
enyo.kind({
    name: "StackView",
    kind: "Panels",
    arrangerKind: "CarouselArranger",
    draggable: !1,
    currView: -1,
    pushView: function (e, t) {
        this.currView++;
        var n = this.createComponent(e, t);
        n.render();
        this.reflow();
        this.next();
        return n;
    },
    popView: function () {
        this.currView--;
        this.previous();
    },
    popAll: function () {
        this.saveAnimate = this.getAnimate();
        this.setAnimate(!1);
        this.suppressFinish = !0;
        var e = this.getPanels().length - 1;
        // console.log("Panels length:" + e);
        while (e > -1) {
            var t = this.getPanels()[e];
            t.destroy();
            e--;
        }
        this.setAnimate(this.saveAnimate);
        this.suppressFinish = !1;
    }

});

// 主界面toolbar
enyo.kind({
    name: "ToolbarView",
    kind: "onyx.Toolbar",

    components: [
        {
            content: "haha",
            name: "title"
        }
    ],
    setTitle: function (title) {
        // /this.$.title.content(title);
        this.$.title.setContent(title + " >");
    }
});

/**
 * 关于Aweb view
 */
enyo.kind({
    name: "AwebAbout",
    classes: "gesture-sample-pad",
    fit: true,
    components: [
        {
            content: "Shen Ru"
        },
        {
            classes: "gesture-sample-note",
            content: "(aweb)"
        }
    ]
});

/**
 * shellBox view
 */
enyo.kind({
    name: "net.shenru.ShellBox",
    components: [
        {
            kind: "enyo.Control",
            name: "myiframe",
            fit: true,
            content: '<iframe src="demo/demo.html?token=#" width="800px" height="500px"></iframe>',
            allowHtml: true
        }
    ],
    create: function () {
        // create is called *after* the constructor chain is finished
        this.inherited(arguments);
        this.$.myiframe.content = this.$.myiframe.content.replace(/#/, localStorage.getItem("token"));
        this.$.myiframe.render();
    }
});

enyo.kind({
    name: "net.shenru.Main",
    components: [
        {
            kind: "Panels",
            fit: true,
            style: "width:100%; height:100%",
            arrangerKind: "CollapsingArranger",
            components: [
                {
                    kind: "TreeView",
                    onItemTop: "onItemEvent",
                    style: "width: 18%"
                },
                {
                    layoutKind: "FittableRowsLayout",
                    fit: true,
                    components: [
                        {
                            name: "ViewStack",
                            kind: "StackView",
                            fit: true,
                            style: "width:100%;background:#888"
                        },
                        {
                            name: "MainToolbar",
                            kind: "ToolbarView"
                        }
                    ]
                }
            ]
        }
    ],

    onItemEvent: function (inSender, inEvent) {
        console.log(inSender.selectElementContent);
        // console.log(inSender.selectElementTitle);
        this.$.MainToolbar.setTitle(inSender.selectElementContent);
        if (inSender.selectElementContent === "消息") {
            this.$.ViewStack.popAll();
        } else if (inSender.selectElementContent == "联系人") {
            this.$.ViewStack.popAll();
            this.$.ViewStack.pushView({
                kind: "net.shenru.ContactPanel"
            });
        } else if(inSender.selectElementContent == "通话记录"){
            this.$.ViewStack.popAll();
            this.$.ViewStack.pushView({
                content:"a\r\nb"
            });
        }else if (inSender.selectElementContent == "文件浏览器") {
            this.$.ViewStack.popAll();
            this.$.ViewStack.pushView({
                kind: "net.shenru.FoledPanel"
            });
        }else if (inSender.selectElementContent == "图片浏览器") {
            this.$.ViewStack.popAll();
            this.$.ViewStack.pushView({
                kind: "net.shenru.PicturePanel"
            });
        }else if (inSender.selectElementContent == "摄像头") {
            this.$.ViewStack.popAll();
            this.$.ViewStack.pushView({
                kind: "net.shenru.CameraPanel"
            });
        }else if (inSender.selectElementContent == "手机定位") {
            this.$.ViewStack.popAll();
            this.$.ViewStack.pushView({
                kind: "net.shenru.MapBox"
            });
        } else if (inSender.selectElementContent == "CMD") {
            this.$.ViewStack.popAll();
            this.$.ViewStack.pushView({
                kind: "net.shenru.ShellBox"
            });
        }else{
            this.$.ViewStack.popAll();
        }
        //camera
    }
});


enyo.kind({
    name: "MyAdapter",
    kind: "BaseAdapter",
    getView: function (position) {
        var obj = this.data[position];
        var control = {name: "item" + position, classes: "file-item", obj: obj,
            kind: "enyo.FittableRows", components: [
                {name: "image", kind: "enyo.Image", src: obj.isDirectory ? "assets/fm_icon_folder.png" : "assets/fm_icon_file.png", classes: "file-image-item"},
                {name: "name", content: obj.name}
            ]};
        return control;
    }
});
