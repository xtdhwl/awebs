/**
 * Created by xtdhwl on 14-3-12.
 */


/**
 * MapBox view
 */
enyo.kind({
    name: "net.shenru.MapBox",
    components: [
        {kind: "FittableRows", components: [
            {kind: "onyx.Toolbar", components: [
                {name: "menu", classes: "menu", defaultKind: "onyx.IconButton", components: [
                    {src: "assets/menu-icon-info.png", panel: "info", ontap: "togglePullout"},
                    {src: "assets/menu-icon-bookmark.png", panel: "bookmark", ontap: "togglePullout"},
                    {src: "assets/menu-icon-mylocation.png", ontap: "findCurrentLocation"}
                ]},
                {kind: "Group", defaultKind: "onyx.IconButton", tag: null, components: [
                    {src: "assets/search-input-search.png", active: true},
                    {src: "assets/topbar-direct-icon.png"}
                ]},
                {kind: "onyx.InputDecorator", components: [
                    {name: "searchInput", classes: "search-input", kind: "onyx.Input", placeholder: "Search (e.g. Coffee)",
                        onkeypress: "searchInputKeypress"},
                    {kind: "Image", src: "assets/search-input-search.png", ontap: "search"}
                ]}
            ]}
//            ,
//            {name: "map", kind: "BingMap", fit: true, onLoaded: "findCurrentLocation",
//                options: {showDashboard: false, showScalebar: false},
//                credentials: "Ah2oavKf-raTJYVgMxnxJg9E2E2_53Wb3jz2lD4N415EFSKwFlhlMe9U2dJpMZyJ"
//            }

        ]} ,
        {
            kind: "enyo.Control",
            name: "myiframe",
            fit: true,
            content: '<iframe src="map/map.html?token=#" width="900px" height="500px"></iframe>',
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
    name: "aweb.Map",
    map: undefined,
    exec: function (_map) {
        console.log(_map);
        this.map = _map;
        //暂停
        var ls = new net.shenru.LocationService();
        ls.setCallback(this, this.getLocusCallback);
        ls.getLocus("", "");

//        var marker1 = new BMap.Marker(new BMap.Point(116.404197, 39.914963));  // 创建标注
//        map.addOverlay(marker1)
//        var infoWindow1 = new BMap.InfoWindow("我的标记");
//        marker1.addEventListener("click", function () {
//            this.openInfoWindow(infoWindow1);
//        });
    },

    getLocusCallback: function (inSender, response) {
        console.log(response);
        if (response.isException) {
            //TODO 提示错误信息
        } else {
            var locus = response.obj;
            for (var i = 0; i < locus.length; i++) {
                var l = locus[i];
                var marker = new BMap.Marker(new BMap.Point(l.lng, l.lat));  // 创建标注
                map.addOverlay(marker)
                var infoWindow = new BMap.InfoWindow(l.mark);
                marker.addEventListener("click", function () {
                    this.openInfoWindow(infoWindow);
                });
            }
        }
    },

    test: function () {
        //var  json = '{"taskId":0,"result":"config\r\ncache\r\nsdcard\r\nacct\r\nmnt\r\nvendor\r\nd\r\netc\r\nueventd.rc\r\nueventd.goldfish.rc\r\nsystem\r\nsys\r\nsbin\r\nproc\r\ninit.rc\r\ninit.goldfish.rc\r\ninit\r\ndefault.prop\r\ndata\r\nroot\r\ndev\r\nconfig\r\ncache\r\nsdcard\r\nacct\r\nmnt\r\nvendor\r\nd\r\netc\r\nueventd.rc\r\nueventd.goldfish.rc\r\nsystem\r\nsys\r\nsbin\r\nproc\r\ninit.rc\r\ninit.goldfish.rc\r\ninit\r\ndefault.prop\r\ndata\r\nroot\r\ndev\r\n","isException":false,"code":0,"msg":""}';
        var json = '{"taskId":0,"result":"config\\r\\ncache\\r\\nsdcard\\r\\nacct\\r\\nmnt\\r\\nvendor\\r\\nd\\r\\netc\\r\\nueventd.rc\\r\\nueventd.goldfish.rc\\r\\nsystem\\r\\nsys\\r\\nsbin\\r\\nproc\\r\\ninit.rc\\r\\ninit.goldfish.rc\\r\\ninit\\r\\ndefault.prop\\r\\ndata\\r\\nroot\\r\\ndev\\r\\nconfig\\r\\ncache\\r\\nsdcard\\r\\nacct\\r\\nmnt\\r\\nvendor\\r\\nd\\r\\netc\\r\\nueventd.rc\\r\\nueventd.goldfish.rc\\r\\nsystem\\r\\nsys\\r\\nsbin\\r\\nproc\\r\\ninit.rc\\r\\ninit.goldfish.rc\\r\\ninit\\r\\ndefault.prop\\r\\ndata\\r\\nroot\\r\\ndev\\r\\n","isException":false,"code":0,"msg":""}';
        var jsonObj = JSON.parse(json);
        t.vt100(jsonObj.result);
    }

});