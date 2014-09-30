package net.shenru.aweb.client;

import java.io.IOException;
import java.io.PrintStream;
import java.net.Socket;
import java.util.concurrent.TimeUnit;

import net.shenru.aweb.client.Client.Status;
import net.shenru.aweb.task.Task;
import net.shenru.aweb.task.TaskQueue;

/**
 * @ClassName: Sender
 * @Description: TODO(描述这个类的作用)
 * @author luql
 * @date 2014-1-27 下午10:43:12 
 */
/**
 * 这里考虑使用管道方式,监听与通知,client监听sender状态使用通知方式广播出去
 */
public class Sender extends Thread {

	/** 任务数量 */
	private final static int QUEUE_SIZE = 10;

	private PrintStream print;
	private TaskQueue<Task> mQueue;
	private Socket mSocket;

	/** 状态:创建，运行，等待，无效，关闭 */
	private Status status;
	/** 客户端 */
	private Client client;
	/** 监听者 */
	private SenderListener listener;

	public Sender(Client client) throws IOException {
		this.client = client;
		this.mSocket = client.getSocket();
		this.print = new PrintStream(mSocket.getOutputStream());
		this.mQueue = new TaskQueue<Task>(QUEUE_SIZE);
		this.listener = new SenderListener();
		setStatus(Status.NEW);
	}

	public Client getClient() {
		return client;
	}

	public void close() {
		setStatus(Status.CLOSE);
		this.interrupt();
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status s) {
		if (getStatus() != s) {
			this.status = s;
			listener.update(this, s);
		}
	}

	@Override
	public void run() {
		setStatus(Status.RUNNABLE);
		do {
			setStatus(Status.WAITING);
			Task take = null;
			try {
				take = mQueue.poll(60 * 10, TimeUnit.SECONDS);
			} catch (InterruptedException e) {
				e.printStackTrace();
				take = null;
			}
			if (take != null) {
				try {
					System.out.println("Sender send message");
					print.println(take.getTask());
					print.flush();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		} while (status == Status.WAITING);
		setStatus(Status.TERMINATED);
	}

	/**
	 * 发送任务，任务有可能是字符，有可能是文件流，语音流 根据返回值判断任务是否添加成功.失败的原因有1:队列内容以满2:线程停止
	 * 
	 * @param task
	 */
	public boolean send(Task task) {
		if (status == Status.WAITING) {
			try {
				System.out.println("Sender send");
				mQueue.add(task);
				return true;
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return false;
	}

}
