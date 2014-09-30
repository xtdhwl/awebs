package net.shenru.aweb.test;

import net.shenru.aweb.task.Task;
import net.shenru.aweb.taskservlet.TaskResponse;

public class TaskTest {

	public static void main(String[] args) {
		// taskJsonTest();
		 whoTest();
	}

	private static void whoTest() {
		//:::1391672337277,,,
//		System.out.println(TaskUtils.createWhoTask().getTask());
		String response = "{taskId:1391683674052,type:'AWEB', result:{name:'haha2', password:'123456'},method:'Who', isException:false, code:'0', msg:''}";
		TaskResponse taskResponse = TaskResponse.create(response);
		System.out.println(taskResponse);
	}

	private static void taskJsonTest() {
		String taskStr = "{id:\"1\",type:\"CMD\",isResponse:\"true\",taskContent:\"kill (ps -A | grep aweb)\"}";
		Task task = Task.create(taskStr);
		System.out.println(task.getTask());
	}
}
