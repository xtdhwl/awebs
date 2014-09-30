package net.shenru.aweb.client;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.net.SocketException;

import net.shenru.aweb.client.Client.Status;
import net.shenru.aweb.taskservlet.TaskResponse;

public class Receiver extends Thread {

	private Client client;
	private Socket mSocket;
	private BufferedReader br;
	private Status status;
	/** 监听者 */
	private ReceiverListener listener;

	public Receiver(Client client) throws IOException {
		this.client = client;
		this.mSocket = client.getSocket();
		this.br = new BufferedReader(new InputStreamReader(mSocket.getInputStream()));
		this.listener = new ReceiverListener();
		setStatus(Status.NEW);
	}

	public Client getClient() {
		return client;
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

	public void close() {
		setStatus(Status.CLOSE);
		this.interrupt();
	}

	@Override
	public void run() {
		setStatus(Status.RUNNABLE);
		try {
			do {
				// log();
				// TODO 接受内容.约定客户端与服务task通讯使用一行一个命令，文件流使用另一个端口传输
				setStatus(Status.WAITING);
				String strLine = br.readLine();
				if (strLine == null) {
					setStatus(Status.TERMINATED);
				} else {
					TaskResponse tr = TaskResponse.create(strLine);
					client.recvTask(tr);
					System.out.println("Receiver taskresponse:" + tr);
				}

			} while (status == Status.WAITING);
		} catch (Exception e) {
			// TODO java.net.SocketException: Connection reset
			e.printStackTrace();
		}
		setStatus(Status.TERMINATED);
	}

	private void log() {
		try {
			System.out.println("getKeepAlive:" + mSocket.getKeepAlive());
		} catch (SocketException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		System.out.println("isBound:" + mSocket.isBound());
		System.out.println("isClosed:" + mSocket.isClosed());
		System.out.println("isConnected:" + mSocket.isConnected());
		System.out.println("isInputShutdown:" + mSocket.isInputShutdown());
		System.out.println("isOutputShutdown:" + mSocket.isOutputShutdown());
	}

}
