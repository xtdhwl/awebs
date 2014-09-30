package net.shenru.aweb.task;

import java.util.HashMap;
import java.util.Map;

import net.shenru.aweb.IDUtil;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

/**
 * @ClassName: Task
 * @Description: 任务
 * @author luql
 * @date 2014-1-29 下午05:39:38
 */
public class Task {
	/**
	 * CMD : 命令 AWEB : 自定义命令 PIPE通道
	 */
	public enum TaskType {
		CMD, AWEB, PIPE
	}

	/** 任务Id，任务应该可以保存到数据库中 */
	private long id;
	/** content有语意产生任务 */
	private String src;
	/** 是否要响应 */
	private boolean isResponse;
	/** 任务类型 */
	private TaskType taskType;
	/** 任务方法 */
	private String method;
	/** 任务内容 */
	private Map<String, String> taskContent;

	public Task() {
		this(IDUtil.getUUID());
	}

	public Task(long id) {
		this.id = id;
		taskContent = new HashMap<String, String>();
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getSrc() {
		return src;
	}

	public void setSrc(String src) {
		this.src = src;
	}

	public boolean isResponse() {
		return isResponse;
	}

	public void setResponse(boolean isResponse) {
		this.isResponse = isResponse;
	}

	public TaskType getTaskType() {
		return taskType;
	}

	public void setTaskType(TaskType taskType) {
		this.taskType = taskType;
	}

	public String getMethod() {
		return method;
	}

	public void setMethod(String method) {
		this.method = method;
	}

	public void addParam(String key, String value) {
		taskContent.put(key, value);
	}

	/**
	 * 保持扩充不修改原则 {id:"1"， type:"cmd", isResponse:"true",
	 * method:"kill (ps -A | grep aweb)"; taskContent:""}
	 */
	public static Task create(String json) {
		Task task;
		try {
			task = new Task(IDUtil.getUUID());
			JSONObject jobj = (JSONObject) new JSONTokener(json).nextValue();
			long id = jobj.getLong("id");
			TaskType taskType = Enum.valueOf(TaskType.class, jobj.getString("type").toUpperCase());
			boolean isResponse = jobj.getBoolean("isResponse");
			String method = jobj.getString("method");
			JSONObject taskJson = (JSONObject) jobj.get("taskContent");
			task.setId(id);
			task.setResponse(isResponse);
			task.setTaskType(taskType);
			task.setMethod(method);
			JSONArray names = taskJson.names();
			if (names != null) {
				for (int i = 0; i < names.length(); i++) {
					String name = (String) names.get(i);
					String value = taskJson.getString(name);
					task.addParam(name, value);
				}
			}
			task.setSrc(json);
			return task;
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return null;
	}

	public String getTask() {
		try {
			JSONObject json = new JSONObject();
			json.put("id", getId());
			json.put("type", getTaskType());
			json.put("isResponse", isResponse());
			json.put("method", getMethod());
			json.put("taskContent", new JSONObject(taskContent));
			return json.toString();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public String toString() {
		return "Task [id=" + id + ", src=" + src + ", isResponse=" + isResponse + ", taskType=" + taskType
				+ ", taskContent=" + taskContent + "]";
	}

	public Map<String, String> getTaskContent() {
		return taskContent;
	}

}
