<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
    <meta name="format-detection" content="telephone=no"/>
    <meta name="google" value="notranslate"/>
    <title>Languages List Sample</title>
    <!-- -->
    <script src="enyo/enyo.js" type="text/javascript"></script>
    <script src="lib/layout/package.js" type="text/javascript"></script>
    <script src="lib/onyx/package.js" type="text/javascript"></script>
    <!-- -->
    <link href="main.css" rel="stylesheet">
    <script src="main.js" type="text/javascript"></script>
    <!-- -->
     <!-- AWeb-->
    <script src="aweblib/package.js" type="text/javascript"></script>
    <script src="aweb/package.js" type="text/javascript"></script>
</head>
<body >
<script type="text/javascript">
	function init(){
		//haha1392306820935|123456
		localStorage.setItem("token",getQueryString("token"));
	}
	function getQueryString(name) {
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    if (r != null) return unescape(r[2]); return null;
	    }
	init();
    
    new net.shenru.Main().renderInto(document.body);
</script>
</body>
</html>