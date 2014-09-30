package net.shenru.aweb.servlet.client;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.shenru.aweb.client.Client;
import net.shenru.aweb.client.ClientManager;
import net.shenru.aweb.task.Task;
import net.shenru.aweb.task.TaskQueue;
import net.shenru.aweb.taskservlet.TaskResponse;

/**
 * @ClassName: SendPipeTaskServlet
 * @Description: 发送管道流
 * @author luql
 * @date 2014-2-19 下午09:53:43
 */
public class SendPipeTaskServlet extends HttpServlet {
	// sendTask
	// {method:getClientList, result:{[token:1, name:haha],[token:2,
	// name:xixi],[token:3, name:shenru]}}
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// TODO 权限检测
		String name = req.getParameter("name");
		String password = req.getParameter("password");
		String token = req.getHeader("token");
		String taskJson = req.getParameter("task");
		if (token == null) {
			resp.getWriter().write("token为空");
			return;
		}

		Client client = ClientManager.getInstance().getClientByToken(token);
		if (client != null) {
			TaskQueue<TaskResponse> sendTask = client.sendTask(Task.create(taskJson));
			try {
				TaskResponse taskResponse = sendTask.poll(30, TimeUnit.SECONDS);
				// TODO taskResponse nullPointerException
				if (taskResponse != null) {
					resp.getWriter().write(taskResponse.getJson());
				}
			} catch (InterruptedException e) {
				resp.getWriter().write("client not response");
			}
		} else {
			resp.getWriter().write("client not 存在");
		}
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}
}
