package net.shenru.aweb.client;

import java.io.IOException;
import java.net.Socket;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import net.shenru.aweb.SLog;
import net.shenru.aweb.task.Task;
import net.shenru.aweb.task.TaskQueue;
import net.shenru.aweb.taskservlet.TaskResponse;

/**
 * @ClassName: Client
 * @Description: 客户端包含发送者、接收者、观察者[观察者：client、发送者、接收者] 状态:
 *               new为创建,连接状态为和客户端连接,准备为接收者和发送者准备好,与客户端断开状态,无效状态理解为应是否完成
 * @author luql
 * @date 2014-2-4 下午01:14:17
 */
public class Client {

	private static final String TAG = Client.class.getSimpleName();

	private Socket mSocket;
	private String name;
	private String password;
	private long createTime;
	private boolean isConnected;
	private Map<Task, TaskQueue<TaskResponse>> taskMap;

	private Status status;
	// 接受和发送者
	private Receiver receiver;
	private Sender sender;
	private ClientListener cListener;

	public enum Status {
		/** 创建 */
		NEW,
		/** 运行 */
		RUNNABLE, /* BLOCKED, */
		/** 等待准备就绪:可以发送与接送命令 */
		WAITING,
		/** 终止:自己调用 */
		TERMINATED,
		/** 关闭:其他人调用 */
		CLOSE
	}

	public Client(Socket socket) {
		mSocket = socket;
		taskMap = new HashMap<Task, TaskQueue<TaskResponse>>();
		cListener = new ClientListener();
		setStatus(Status.NEW);
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		if (getStatus() != status) {
			this.status = status;
			cListener.update(this, status);
		}
	}

	public Receiver getReceiver() {
		return receiver;
	}

	public Sender getSender() {
		return sender;
	}

	public boolean isConnected() {
		return isConnected;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public void connect() {
		createTime = System.currentTimeMillis();
		// 初始化接受者和发送者
		initReceiver();
		initSender();
	}

	public void close() {
		setStatus(Status.CLOSE);
		if (mSocket != null) {
			try {
				mSocket.shutdownInput();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			try {
				mSocket.shutdownOutput();
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			try {
				mSocket.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		if (receiver != null) {
			receiver.close();
		}
		if (sender != null) {
			sender.close();
		}
		for (Entry<Task, TaskQueue<TaskResponse>> entry : taskMap.entrySet()) {
			entry.getValue().clear();
		}
		taskMap.clear();
	}

	public void removeTask(Task task) {
		TaskQueue<TaskResponse> taskQueue = taskMap.get(task);
		if (taskQueue != null) {
			taskQueue.clear();
			taskMap.remove(task);
		}
	}

	public TaskQueue<TaskResponse> sendTask(Task task) {
		System.out.println("client sendTask");
		if (task == null) {
			throw new IllegalStateException("task is null");
		}
		TaskQueue<TaskResponse> tr = new TaskQueue<TaskResponse>(10);
		taskMap.put(task, tr);
		boolean isSended = sender.send(task);
		if (isSended) {
			return tr;
		}
		return null;
	}

	public boolean recvTask(TaskResponse response) {
		// 响应任务,通过response中的ID的得到task
		System.out.println("recvTask");
		Set<Entry<Task, TaskQueue<TaskResponse>>> entrySet = taskMap.entrySet();
		Iterator<Entry<Task, TaskQueue<TaskResponse>>> iterator = entrySet.iterator();
		while (iterator.hasNext()) {
			Entry<Task, TaskQueue<TaskResponse>> next = iterator.next();
			Task key = next.getKey();
			if (key.getId() == response.getTaskId()) {
				TaskQueue<TaskResponse> value = next.getValue();
				try {
					value.put(response);
				} catch (InterruptedException e) {
					e.printStackTrace();
				} finally {
					iterator.remove();
				}
				return true;
			}
		}
		return false;
	}

	/**
	 * 添加一个通道
	 * 
	 */
	public Piper addPipeTask(Task task) {
		Piper p = new Piper();
		p.init();
		return p;
	}

	/**
	 * 打开一个通道
	 */
	public Piper openPipeTask() {
		Piper p = new Piper();
		p.init();
		return p;
	}

	public Socket getSocket() {
		return mSocket;
	}

	private void initReceiver() {
		try {
			receiver = new Receiver(this);
			receiver.start();
		} catch (IOException e) {
			SLog.e(TAG, e.getMessage(), e);
			if (receiver != null) {
				receiver.close();
				receiver = null;
			}
			// 初始化失败
			status = Status.TERMINATED;
			isConnected = false;
		}
	}

	private void initSender() {
		try {
			sender = new Sender(this);
			sender.start();
		} catch (IOException e) {
			SLog.e(TAG, e.getMessage(), e);
			if (sender != null) {
				sender.close();
				sender = null;
			}
			// 初始化失败
			status = Status.TERMINATED;
			isConnected = false;
		}
	}

	/**
	 * 用户名和密码+连接时间=token
	 * 
	 * @return
	 */
	public String getToken() {
		return name + "|" + password /* + "|" + createTime */;
	}

}
