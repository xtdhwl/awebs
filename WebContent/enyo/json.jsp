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
    <link href="list.css" rel="stylesheet">
    <script src="list.js" type="text/javascript"></script>
    <!-- -->
</head>
<body>
<script type="text/javascript">

    function jsonTest(){
        //var str = '{"name":"xtdhwl"}';
        var str = '{"taskId":1,"result":[{"mobile":"18888888888","name":"shenru","id":119}]}';
        var json = JSON.parse(str);
        alert(json.result);
    }
    jsonTest();
    //new enyo.sample.List
</script>
</body>
</html>
