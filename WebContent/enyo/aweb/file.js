/**
 * Created by xtdhwl on 14-2-27.
 */


enyo.kind({
    name: "net.shenru.FoledPanel",
    style: "position: absolute;left: 0;top: 0;right: 0;bottom: 0;",
    classes: "enyo-fit",
    components: [
        { kind: "FittableColumns", style: "width:100%", classes: "onyx-toolbar onyx-toolbar-inline",
            components: [
                {
                    kind: "onyx.InputDecorator",
                    components: [
                        {  kind: "onyx.Input", placeholder: "搜索文件", onkeyup: "inputChanged"  },
                        { kind: "Image", src: "assets/search-input-search.png"  }
                    ]
                },
                {  fit: true  },
                {  kind: "onyx.Button", fit: true, content: "删除", ontap: "delecteClicker"  },
                {  kind: "onyx.Button", content: "刷新", ontap: "refreshClicker" },
                {  kind: "onyx.Button", content: "上传", ontap: "addFileClicker" },
                {  kind: "onyx.Button", name: "downView", content: "下载", ontap: "downFileClicker" }
            ]
        },
        {
            kind: "FittableColumns", style: "height: 100%",
            components: [
                {
                    style: "width:20%;height:100%; background:lightgray;",
                    classes: "enyo-unselectable  enyo-fit",
                    components: [
                        {kind: "Selection", onSelect: "select", onDeselect: "deselect"},
                        {kind: "Scroller", style: " height:100% ; background:lightgray;", fit: true, components: [
                            {kind: "Node", name: "tree", content: "文件管理器", expandable: true,
                                expanded: true, onExpand: "nodeExpand", onNodeTap: "nodeClicker"
                            }
                        ]}
                    ]
                },
                {
                    kind: "Scroller", classes: "scroller-sample-scroller enyo-fit",
                    style: "position:relative; left:20%; ", fit: true,
                    components: [
                        {
//                            name: "fileGridView", kind: "GridView", style: " height:100%;",
//                            onItemTop: "gridItemClicker",
//                            onItemDblClick: "gridItemDbClicker"
                            name: "fileGridView",
                            kind: "aweb.GridFlyWeightRepeater",
                            onSetupItem: "setupItem",
                            ontap:"gridItemClicker",
                            ondblclick:"gridItemDbClicker",
                            rowCount: 6,
                            components: [
                                /*{name: "name", style: "width:100px;  height:100px; background:#00ff00; margin:10px;", content: "哈哈"}*/
                                {   name: "item", style: "padding:10px",
                                    components: [
                                        {name: "fileimage", style: "width:50px;height:50px", kind: "enyo.Image", src: "assets/fm_icon_file.png" },
                                        {name: "name", content: "-", style: "width:60px;text-overflow:ellipsis;overflow:hidden;"}

                                    ]}
                            ]
                        }
                    ]
                },
                {
                    //from 表单
                    name: "fileForm",
                    showing: false,
                    formcontent: '<form action="../fileTask' + "?t=" + Math.random() + ' method="post" id="myFileform">  ' +
                        ' <input type="hidden" name="token" value="@" />' +
                        ' <input type="hidden" name="path" value="#" />' +
                        ' <input type="hidden" name="t" value="&" />' +
                        '</form>',
                    allowHtml: true,
                    submit: function (file) {
                        var token = localStorage.getItem("token");
                        this.content = this.formcontent.replace(/@/, token);
                        this.content = this.content.replace(/#/, file.path);
                        this.content = this.content.replace(/&/, Math.random());
                        this.render();
                        var f = document.getElementById("myFileform");
                        console.log(f);
                        f.submit();
                    }
                }
            ]
        }
    ],
    /**当前目录*/
    path: "/",
    /**目录树*/
    files: null,
    gridfiles: null,
    /**选择的文件*/
    selectFile: null,
    create: function () {
        this.inherited(arguments);
        this.refreshClicker(null, null);
//        this.test();
    },
    /**GridView item单点击事件:打开子目录*/
    gridItemClicker: function (inSender, inEvent) {
//        var f = this.$.fileGridView.getAdapter().getObject(inSender.selectPosition);
        var index = inEvent.index;
        var f = this.gridfiles.childs[index];
        if (f.isDirectory) {
            //是目录
            this.$.downView.setDisabled(true); 
        } else {
            this.$.downView.setDisabled(false);
            this.selectFile = f;
        } 
    },
    /**GridView item:选择文件*/
    gridItemDbClicker: function (inSender, inEvent) {
        this.$.downView.setDisabled(true); 
        var index = inEvent.index;
        var f = this.gridfiles.childs[index];
        if (f.isDirectory) {
            //是目录
            this.$.downView.setDisabled(true);
            var cs = new net.shenru.FileService();
            cs.setCallback(this, this.gridFileCallback);
            cs.getFolder(f.path);
        }
    },
    /**节点展开*/
    nodeClicker: function (inSender, inEvent) {
        this.$.downView.setDisabled(true);
        //TODO onlyIconExpands作用点击图表进行展开
        //实现aridroid点击图表进行展开点击目录刷新GridView
        var node = inEvent.originator;
        var folder = node.obj;
        if (folder.childs) {
            //已经获取了目录
            var adapter = new MyAdapter();
            adapter.setData(folder.childs);
//            this.$.fileGridView.setAdapter(adapter);
            this.gridfiles = folder;
            this.$.fileGridView.setCount(this.gridfiles);
            this.$.fileGridView.render();
        } else {
            //没有获取过目录
            var cs = new net.shenru.FileService();
            cs.setCallback(this, this.gridFileCallback);
            cs.getFolder(folder.path);
        }
    },
    addFileClicker: function (inSender, inEvent) {
        alert("上传文件");
    },
    downFileClicker: function (inSender, inEvent) {
        if (this.selectFile) {
            //利用form下载文件
            this.$.fileForm.submit(this.selectFile);
        }
    },
    getFileCallback: function (inSender, response) {
        console.log("getFileCallback:" + response);
    },
    refreshClicker: function (inSender, inEvent) {
        var cs = new net.shenru.FileService();
        cs.setCallback(this, this.refreshCallback);
        cs.getFolder(this.path);
    },
    refreshCallback: function (inSender, response) {
        console.log("refreshCallback:" + response);
        if (response.isException) {
            // TODO 提示
            // show(response.msg);
        } else {
            inSender.doFolderCallback(response.obj);
        }
    },
    gridFileCallback: function (inSender, response) {
        //点击GridView控件回调
        this.refreshCallback(inSender, response);
    },
    /**把文件附属到主目录*/
    addFileToTree: function (files, f) {
        //判断根
        if (files.path == f.path) {
            //跟节点相同，直接赋值
            files = f;
            return true;
        } else {
            //在子节点中找
            if (files.childs) {
                for (var i = 0; i < files.childs.length; i++) {
                    //这里使用了：递归
                    var isAdd = arguments.callee(files.childs[i], f);
                    if (isAdd) {
                        files.childs[i] = f;
                        return;
                    }
                }
            }
        }
        return false;
    },
    /**把文件目录转为component*/
    fileToComponents: function (files, isRoot) {
        var control = {};
        control.icon = "assets/folder.png";
        control.content = files.name;
        control.path = files.path;
        control.expandable = true;
        control.expanded = true;
        control.obj = files;
        //TODO 这里root是每次tree刷新把root节点删除掉
        control.root = isRoot;
        control.components = [];
        for (var i = 0; i < files.childs.length; i++) {
            var f = files.childs[i];
            if (f.isDirectory) {
                if (f.childs) {
                    var child = this.fileToComponents(f, false);
                    control.components.push(child);
                } else {
                    var child = {};
                    child.icon = "assets/folder.png";
                    child.content = f.name;
                    child.path = f.path;
                    child.obj = f;
                    control.components.push(child);
                }
            }
        }
        return control;
    },
    doFolderCallback: function (files) {
        //把files节点添加到主节点上
        if (!this.files) {
            this.files = files;
        } else {
            //这里不是第一次
            this.addFileToTree(this.files, files);
        }

        //移除note
        var com = this.$.tree.getComponents();
        for (var i = 0; i < com.length; i++) {
            var c = com[i];
            if (c.root == true) {
                //TODO 这里学习了怎么把一个控件在另一个控件上移除
                c.destroy();
                break;
            }
        }

        //设置tree
        var control = this.fileToComponents(this.files, true);
        this.$.tree.createComponent(control);
        this.$.tree.render();

        //设置文件夹
        //TODO
//        var adapter = new MyAdapter();
//        adapter.setData(files.childs);
//        this.$.fileGridView.setAdapter(adapter);
        this.gridfiles = files;
        this.$.fileGridView.setCount(this.gridfiles.childs.length);
        this.$.fileGridView.render();
    },
    setupItem: function (inSender, inEvent) {
        //TODO
        var index = inEvent.index;
        var file = this.gridfiles.childs[index];
        this.log(inEvent.index);
        this.log(file.path);

        this.$.name.setContent(file.name);
        if (file.isDirectory) {
            this.$.fileimage.setSrc("assets/fm_icon_folder.png");
        } else {
            this.$.fileimage.setSrc("assets/fm_icon_file.png");
        }
        this.$.item.addRemoveClass("list-sample-selected", inSender.isSelected(index));
    },
    gridSelect: function (inSender, inEvent) {
        inEvent.data.$.caption.applyStyle("background-color", "lightblue");
    },
    gridDeselect: function (inSender, inEvent) {
        inEvent.data.$.caption.applyStyle("background-color", null);
    },
    test: function () {
        var json = {"taskId": 0, "result": {"childs": [
            {"path": "/cached", "name": "cache", "isDirectory": true, "lastModified": 1.393921579E12, "length": 0.0},
            {"path": "/config", "name": "configddddddddddfsdfsda", "isDirectory": false, "lastModified": 1.394199094E12, "length": 0.0}
        ],
            "path": "/", "name": "", "isDirectory": true, "lastModified": 1.394199094E12, "length": 0.0},
            "isException": false, "code": 0, "msg": ""};
        this.doFolderCallback(json.result)
    }

});