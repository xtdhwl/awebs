package net.shenru.aweb.taskservlet;

import net.shenru.aweb.client.Client;
import net.shenru.aweb.task.Task;

public class TaskRequest {

	private Client client;
	private Task task;

	public Client getClient() {
		return client;
	}

	public void setClient(Client client) {
		this.client = client;
	}

	public Task getTask() {
		return task;
	}

	public void setTask(Task task) {
		this.task = task;
	}

}
