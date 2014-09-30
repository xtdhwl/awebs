package net.shenru.aweb;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.shenru.aweb.client.ClientService;

public class WebServlet extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		System.out.println("doGet");
		if (!ClientService.getInstance().isRuning()) {
			ClientService.getInstance().start();
		}
		String token = req.getHeader("token");
		if (token != null && !"".equals(token)) {
			String content = req.getParameter("content");
			resp.getWriter().write(content);
			return;
		}

	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}

}
