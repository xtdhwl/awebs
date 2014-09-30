package net.shenru.aweb.servlet.client;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.shenru.aweb.client.Client;
import net.shenru.aweb.client.ClientManager;
import net.shenru.aweb.model.ImageVo;
import net.shenru.aweb.task.Task;
import net.shenru.aweb.task.TaskQueue;
import net.shenru.aweb.taskservlet.TaskResponse;
import net.shenru.aweb.util.ByteUtil;

import com.google.gson.Gson;

/**
 * @ClassName: ImageTaskServlet
 * @Description: 这里应该抽取一个BaseServlet:File Send Image三种servlet
 * @author luql
 * @date 2014-3-7 下午09:29:23
 */
public class ImageTaskServlet extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// TODO 权限检测

		// 流程
		// 1：客户端请求服务器，服务器根据参数生成json发送给被控端然后被控端根据命令发送到json的data格式为:10101，在有服务器解析data为img展示给客户端
		// 客户端请求图片http://aweb.com/imageTask(.png|.jpg)?size="320*480"&path="camear"&type="fit"
		// 服务器根据参数生成json {id:1,type:"AWEB", isResponse:true, method:"getImage",
		// taskContent:{path:"",size:"",type=""}}
		// 被控端返回数据{taskId:"",result:"010010","isException":false,"code":0,"msg":""},解析result数据生成图片返回给客户端

		// http://aweb.com/imageTask(.png|.jpg)?imgSize="320*480"&path="camear"&type="fit"
		// 图片的大小，路径

		String name = req.getParameter("name");
		String password = req.getParameter("password");
		String token = req.getHeader("token");
		token = token != null ? token : req.getParameter("token");
		String taskJson = req.getParameter("task");
		if (token == null) {
			resp.getWriter().write("token为空");
			return;
		}

		Client client = ClientManager.getInstance().getClientByToken(token);

		if (client != null) {
			String json = "{id:1,type:'AWEB',isResponse:true,method:'getImage',taskContent:@}";

			String path = req.getParameter("path");
			ImageVo iv = new ImageVo();
			iv.setPath(path);
			String ivJson = new Gson().toJson(iv);

			json = json.replaceFirst("@", ivJson);
			Task task = Task.create(json);
			resp.addHeader("Content-Type", "image/png");
			TaskQueue<TaskResponse> sendTask = client.sendTask(task);
			try {
				TaskResponse taskResponse = sendTask.poll(60, TimeUnit.SECONDS);
				String result = (String) taskResponse.getResult();
				byte[] png = createPng(result);
				if (taskResponse != null) {
					resp.getOutputStream().write(png);
				}
			} catch (InterruptedException e) {
				resp.getWriter().write("client not response");
			}
		} else {
			resp.getWriter().write("client not 存在");
		}
	}

	private byte[] createPng(String result) throws FileNotFoundException, IOException {
		// 37810 7658
		byte[] b = new byte[result.length() / 2];
		System.out.println(b.length);
		for (int i = 0; i < b.length; i++) {
			String str = result.substring(i * 2, i * 2 + 2);
			System.out.println(str);
			byte tobyte = ByteUtil.hexToByte(str);
			b[i] = tobyte;
		}
		return b;
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}
}
