package net.shenru.aweb.servlet.client;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import net.shenru.aweb.client.Client;
import net.shenru.aweb.client.ClientManager;
import net.shenru.aweb.client.Piper;
import net.shenru.aweb.exception.NoClientException;
import net.shenru.aweb.model.FileVo;
import net.shenru.aweb.task.Task;
import net.shenru.aweb.task.TaskQueue;
import net.shenru.aweb.taskservlet.TaskResponse;

import com.google.gson.Gson;

public class SendTaskServlet extends HttpServlet {
	// sendTask
	// {method:getClientList, result:{[token:1, name:haha],[token:2,
	// name:xixi],[token:3, name:shenru]}}
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// TODO 权限检测
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
			Task task = Task.create(taskJson);
			String method = task.getMethod();
			if ("getFile".equals(method)) {
				// pipe(resp, client, task);
				Piper piper = client.openPipeTask();
				// TODO 设置task端口 piper.getPort();
				int piprPort = piper.getPort();
				if (piprPort != -1) {
					piper.setOutputStream(resp.getOutputStream());
					resp.setContentType("application/octet-stream; charset=UTF-8");
					resp.addHeader("Content-Disposition", "attachment;filename=test.txt");
					
					FileVo fileTask = new Gson().fromJson(new JSONObject(task.getTaskContent()).toString(),
							FileVo.class);
					fileTask.setPort(piper.getPort());

					task.addParam("path", fileTask.getPath());
					task.addParam("port", fileTask.getPort() + "");
					client.sendTask(task);

					try {
						piper.waitFinish();
					} catch (NoClientException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}

			} else {
				TaskQueue<TaskResponse> sendTask = client.sendTask(task);
				try {
					TaskResponse taskResponse = sendTask.poll(30, TimeUnit.SECONDS);
					// TODO taskResponse nullPointerException
					if (taskResponse != null) {
						resp.getWriter().write(taskResponse.getJson());
					}
				} catch (InterruptedException e) {
					resp.getWriter().write("client not response");
				}
			}
		} else {
			resp.getWriter().write("client not 存在");
		}
	}

	private void pipe(HttpServletResponse resp, Client client, Task task) throws SocketException, IOException {
		Map<String, String> taskContent = task.getTaskContent();
		FileVo fileTask = new Gson().fromJson(new JSONObject(taskContent).toString(), FileVo.class);

		resp.setContentType("application/octet-stream; charset=UTF-8");
		resp.addHeader("Content-Disposition", "attachment;filename=test.txt");
		// resp.addHeader("Content-Length",
		// String.valueOf(bytes.length));

		// 添加一个通道
		// client.addPipeTask(task);
		client.sendTask(task);
		DatagramSocket ds = new DatagramSocket();
		// 发送
		InetAddress inetAddress = client.getSocket().getInetAddress();

		ds = new DatagramSocket(new InetSocketAddress(/*
													 * inetAddress.
													 * getHostAddress(),
													 */fileTask.getPort()));
		byte[] buf = new byte[64];
		DatagramPacket datagramPacket = new DatagramPacket(buf, buf.length);
		int length = -1;
		do {
			ds.receive(datagramPacket);
			length = datagramPacket.getLength();
			System.out.println("length:" + length);
			if (length > 0) {
				resp.getOutputStream().write(buf, 0, length);
			}
		} while (length > 0);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}
}
