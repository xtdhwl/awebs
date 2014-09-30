package net.shenru.aweb.taskservlet;

import net.shenru.aweb.task.Task;

public interface ITaskServlet {

	public Task submitTask();

	public boolean onResponse(TaskResponse response);

	public boolean error(TaskRequest taskRequest);
	
	public long getWaitTime();

}
