package net.shenru.aweb.servlet.client;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import net.shenru.aweb.client.Client;
import net.shenru.aweb.client.Client.Status;
import net.shenru.aweb.client.ClientManager;

/**
 * @ClassName: UserListServlet
 * @Description: 用户列表
 * @author luql
 * @date 2014-1-28 上午07:43:04
 */
public class ClientListServlet extends HttpServlet {

	// getClientList
	// {method:getClientList, result:{[token:1, name:haha],[token:2,
	// name:xixi],[token:3, name:shenru]}}
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// TODO 权限检测
		String name = req.getParameter("name");
		String password = req.getParameter("password");
		String token = req.getHeader("token");

		List<Client> clients = ClientManager.getInstance().getClientsByStatue(Status.WAITING);
		List<Client> result = new ArrayList<Client>();

		JSONObject jobj = new JSONObject();
		JSONArray jarray = new JSONArray();
		try {
			jobj.put("method", "getClientList");
			jobj.put("result", jarray);
			for (Client c : clients) {
				if (c.getToken() != null) {
					try {
						JSONObject cjson = new JSONObject();
						cjson.put("token", c.getToken());
						cjson.put("name", c.getName());
						jarray.put(cjson);
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
			resp.getWriter().write(jobj.toString());
		} catch (JSONException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}

}
