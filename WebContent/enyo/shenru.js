enyo.path.addPaths({layout: "lib/layout/",
    onyx: "lib/onyx/",
    onyx: "lib/onyx/source/",
    g11n: "lib/g11n/",
    canvas: "lib/canvas/"});



enyo.kind({
    name: "ViewStack",
    kind: "Panels",
    arrangerKind: "CarouselArranger",
    draggable: !1,
    handlers: {
        onTransitionFinish: "transitionFinish"
    },
    currView: -1,
    transitionFinish: function() {
        if (this.suppressFinish)
            return !0;
        var e = this.getPanels().length - 1;
        if (e > this.currView) {
            this.suppressFinish = !0, this.saveAnimate = this.getAnimate(), this.setAnimate(!1);
            while (e > this.currView) {
                var t = this.getPanels()[e];
                t.destroy(), e--;
            }
            this.setIndexDirect(this.currView), this.setAnimate(this.saveAnimate), this.suppressFinish = !1;
        }
    },
    pushView: function(e, t) {
        this.currView++;
        var n = this.createComponent(e, t);
        return n.render(), this.reflow(), this.next(), n;
    },
    popView: function() {
        this.currView--, this.previous();
    },
    popToRootView: function(e) {
        this.currView = 0, e ? this.setIndexDirect(0) : this.setIndex(0);
    },
    popAll: function() {
        this.saveAnimate = this.getAnimate(), this.setAnimate(!1), this.suppressFinish = !0;
        var e = this.getPanels().length - 1;
        while (e > -1) {
            var t = this.getPanels()[e];
            t.destroy(), e--;
        }
        this.setAnimate(this.saveAnimate), this.suppressFinish = !1;
    }
}),

    enyo.kind({
        name:"enyo.sample.Shenru",
        kind:"Panels",
        classes:"page",
        arrangerKind:"CollapsingArranger",
        components: [{
            kind: "Panels",
            name: "mainPanels",
            classes: "panels enyo-fit",
            arrangerKind: "CollapsingArranger",
            components: [{
                kind: "ViewStack",
                name: "navPanels",
                onTransitionFinish: "navChanged",
                classes: "enyo-fit"
            }, {
                kind: "Panels",
                name: "contentPanels",
                arrangerKind: "CollapsingArranger",
                draggable: !1,
                classes: "panels enyo-fit",
                onTransitionFinish: "contentTransitionComplete",
                components: [{
                    kind: "FittableRows",
                    classes: "wide",
                    components: [{
                        kind: "Scroller",
                        name: "sampleContent",
                        horizontal: "hidden",
                        fit: !0,
                        classes: "onyx enyo-unselectable"
                    }, {
                        kind: "onyx.Toolbar",
                        layoutKind: "FittableColumnsLayout",
                        name: "viewSourceToolbar",
                        noStretch: !0,
                        classes: "footer-toolbar",
                        components: [{
                            kind: "onyx.Grabber",
                            ontap: "toggleFullScreen"
                        }, {
                            fit: !0
                        }, {
                            kind: "onyx.Button",
                            name: "viewSource",
                            content: "View Source",
                            ontap: "viewSource",
                            showing: !1
                        }, {
                            kind: "onyx.TooltipDecorator",
                            showing: document.location.protocol != "file:",
                            components: [{
                                kind: "onyx.Button",
                                name: "openFiddle",
                                ontap: "openFiddle",
                                style: "padding-left:8px; padding-right:8px;",
                                showing: !1,
                                components: [{
                                    kind: "onyx.Icon",
                                    src: "assets/fiddle.png",
                                    style: "margin-top:-5px;"
                                }]
                            }, {
                                kind: "onyx.Tooltip",
                                content: "Open sample in jsFiddle"
                            }]
                        }, {
                            kind: "onyx.TooltipDecorator",
                            showing: document.location.protocol != "file:",
                            components: [{
                                kind: "onyx.Button",
                                name: "openExternal",
                                ontap: "openExternal",
                                style: "padding-left:8px; padding-right:8px;",
                                showing: !1,
                                components: [{
                                    kind: "onyx.Icon",
                                    src: "assets/open-external.png",
                                    style: "margin-top:-5px;"
                                }]
                            }, {
                                kind: "onyx.Tooltip",
                                content: "Open sample in new tab"
                            }]
                        }]
                    }]
                }]
            }]
        }],


        rendered: enyo.inherit(function(sup){
            return function(){
                //alert("rendered");
                sup.apply(this, arguments);
                localStorage.setItem("key", "haha");

                alert(localStorage.getItem("key"));
                //this.$.list.setCount(10);
                //this.$.list.reset();
            }
        }),
        setupItem:function(inSender,inEvent){
            // alert("setupItem");
            this.$.text.setContent("1");
        },
        itemSelected: function(inSender, inEvent) {
            alert("itemSelected");
            //var index = inEvent.index;
            //var count = inEvent.flyweight.count;
            //if(index>=0 && index<count){
            //this.$.result.setContent(" [" + (index+1) + ". " + this.people[index].name + "] is selected");
            //}
            return true;
        },
        navTap: function(e, t) {
            alert("navTap");
            this.$.list.selected = 1;//t.index, this.doNavTap(t);
        },
        loadSamples: function() {
            this.$.navPanels.popAll(), (new enyo.Ajax({
                url: "assets/manifest.json"
            })).response(this, function(e, t) {
                    this.samples = t, this.samples.isTop = !0;
                    var n = this.sourcePath || localStorage.getItem("sourcePath") || this.samples.sourcePath;
                    n && (enyo.path.addPath("lib", n + "/lib"), enyo.path.addPath("enyo", n + "/enyo")), (this.sourcePath || localStorage.getItem("sourcePath")) && this.loadSamplePackages(t), this.addSamples = enyo.json.parse(localStorage.getItem("addSamples")), this.loadAddSamples();
                }).go();
        }
    });


