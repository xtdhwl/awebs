package net.shenru.aweb.taskservlet;

import java.util.concurrent.TimeUnit;

import net.shenru.aweb.client.Client;
import net.shenru.aweb.task.Task;
import net.shenru.aweb.task.TaskQueue;

public abstract class TaskServlet implements ITaskServlet, Runnable {

	private Client client;

	@Override
	public abstract Task submitTask();

	@Override
	public boolean onResponse(TaskResponse response) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean error(TaskRequest taskRequest) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public long getWaitTime() {
		return 1000 * 30;
	}

	public TaskRequest getTaskRequest() {
		return null;
	}

	public Client getClient() {
		return client;
	}

	@Override
	public void run() {
		// TODO Auto-generated method stub
		Task submitTask = this.submitTask();
		TaskQueue<TaskResponse> sendTaskQueue = client.sendTask(submitTask);
		if (sendTaskQueue != null) {
			long time = this.getWaitTime();
			try {
				TaskResponse taskResponse = sendTaskQueue.poll(time, TimeUnit.MILLISECONDS);
				if (taskResponse != null) {
					onResponse(taskResponse);
				} else {
					TaskRequest taskRequest = new TaskRequest();
					error(taskRequest);
				}
			} catch (InterruptedException e) {
				e.printStackTrace();
				TaskRequest taskRequest = new TaskRequest();
				error(taskRequest);
			}
		} else {
			TaskRequest taskRequest = new TaskRequest();
			error(taskRequest);
		}
	}

	public void send(Client client) {
		this.client = client;
		new Thread(this).start();
	}

}
