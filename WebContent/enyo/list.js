enyo.path.addPaths({layout: "lib/layout/",
    onyx: "lib/onyx/",
    onyx: "lib/onyx/source/",
    g11n: "lib/g11n/",
    canvas: "lib/canvas/"});

enyo.kind({
    name: "enyo.sample.ListSimple",
    components: [
        {kind: "enyo.List", count: 20000, onSetupItem: "setupItem",classes: "enyo-fit", name: "mylist", components: [
            {content: "item", classes:"enyo-border-box"}
        ]}
    ], setupItem: function (inSender, inEvent) {
        inSender.setContent("aaa");
    }
})

