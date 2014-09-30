enyo.path.addPaths({layout: "lib/layout/",
    onyx: "lib/onyx/",
    onyx: "lib/onyx/source/",
    g11n: "lib/g11n/",
    canvas: "lib/canvas/"});


enyo.kind({
    name: "enyo.sample.ListSimple",


    components: [
        {kind: "Panels",
            fit: true, style: "width:100%; height:100%",
            arrangerKind: "CollapsingArranger",

            components: [
                {content: "test", style: "width:80px"},
                {  Kind: "FittableRows",components: [
                    {components: [
                        {content: "top test"},
                        {name: "list", kind: "List", count: 20000, multiSelect: false, fit:"true", onSetupItem: "setupItem", components: [
                            //ontap 设置点击事件 classes: "enyo-fit list-simple-list",
                            {name: "item", classes: "list-sample-item enyo-border-box", ontap: "itemTap", components: [
                                {name: "index", classes: "list-sample-index"},
                                {name: "name"}
                            ]}
                        ], setupItem: function (inSender, inEvent) {
                            alert("aaa");
                            this.$.name.setContent(i);
                            this.$.index.setContent("aaa");
                        }}
                    ]}
                ]}
            ]}
        /*{kind: "FittableRows", fit: true, components: [
         {name: "list", kind: "List", count: 20000, multiSelect: false, classes: "enyo-fit list-simple-list", onSetupItem: "setupItem", components: [
         //ontap 设置点击事件
         {name: "item", classes: "list-sample-item enyo-border-box", ontap: "itemTap", components: [
         {name: "index", classes: "list-sample-index"},
         {name: "name"}
         ]}
         ]}
         ],
         setupItem: function (inSender, inEvent) {
         this.$.name.setContent(i);
         this.$.index.setContent("aaa");
         }}*/
    ]




})
;
