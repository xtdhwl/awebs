package net.shenru.aweb.taskservlet;

import org.json.JSONException;
import org.json.JSONObject;

import net.shenru.aweb.IDUtil;
import net.shenru.aweb.client.Client;
import net.shenru.aweb.task.Task;
import net.shenru.aweb.task.Task.TaskType;

/**
 * @ClassName: WhoTaskServlet
 * @Description: 请求是谁
 * @author luql
 * @date 2014-1-30 上午11:03:28
 */
public class WhoTaskServlet extends TaskServlet {

	@Override
	public Task submitTask() {
		Task task = new Task(IDUtil.getUUID());
		task.setResponse(true);
		task.setMethod("Who");
		task.setTaskType(TaskType.AWEB);
		return task;
	}

	@Override
	public boolean onResponse(TaskResponse response) {
		System.out.println("WhoTaskServlet onResponse");
		// String json = response.getResult();
		// CWhovo cWho = CWhovo.create(json);
		// String name = cWho.getName();
		//
		// TaskRequest request = getTaskRequest();
		// Client client = request.getClient();
		// client.setName(name);
		String result = (String) response.getResult();
		try {
			JSONObject json = new JSONObject(result);
			String name = json.getString("name");
			String password = json.getString("password");
			Client client = getClient();
			client.setName(name);
			client.setPassword(password);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return super.onResponse(response);
	}

	@Override
	public boolean error(TaskRequest taskRequest) {
		System.out.println("WhoTaskServlet error");
		// TODO Auto-generated method stub
		return super.error(taskRequest);
	}

}
