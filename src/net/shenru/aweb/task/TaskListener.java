package net.shenru.aweb.task;

import net.shenru.aweb.taskservlet.TaskResponse;

public interface TaskListener {
	public void onReceiver(TaskResponse tr);
}
