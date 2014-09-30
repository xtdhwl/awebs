package net.shenru.aweb.taskservlet;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import com.google.gson.Gson;

public class TaskResponse {

	private long taskId;
	private Object result;
	private boolean isException;
	private int code;
	private String msg;

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public void setTaskId(long taskId) {
		this.taskId = taskId;
	}

	public void setResult(Object result) {
		this.result = result;
	}

	public void setException(boolean isException) {
		this.isException = isException;
	}

	/**
	 * 返回结果
	 * 
	 * @return
	 */
	public Object getResult() {
		return result;
	}

	public String getJson() {
		return new Gson().toJson(this);
	}

	/**
	 * 任务ID
	 * 
	 * @return
	 */
	public long getTaskId() {
		return taskId;
	}

	public boolean isException() {
		return isException;
	}

	public static TaskResponse create(String json) {
		try {
			return new Gson().fromJson(json, TaskResponse.class);
//			taskResponse = new TaskResponse();
//			JSONObject jobj = (JSONObject) new JSONTokener(json).nextValue();
//			long id = jobj.getLong("taskId");
//			// TaskType taskType = Enum.valueOf(TaskType.class,
//			// jobj.getString("type").toUpperCase());
//			// // boolean isResponse = jobj.getBoolean("isResponse");
//			// String method = jobj.getString("method");
//			Object result = jobj.get("result");
//			taskResponse.setTaskId(id);
//			// taskResponse.setTaskType(taskType);
//			// taskResponse.setMethod(method);
//			taskResponse.setResult(result);
//			return taskResponse;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public String toString() {
		return "TaskResponse [taskId=" + taskId + ", result=" + result + ", isException=" + isException + ", code="
				+ code + ", msg=" + msg + "]";
	}

}
