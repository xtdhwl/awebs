package net.shenru.aweb.client;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @ClassName: ClientConnect
 * @Description: 客户端ServerSocker负责连接用户
 * @author luql
 * @date 2014-1-29 下午09:55:41
 */
public class ClientConnect extends Thread {
	private ServerSocket ss;
	private boolean isRuning;

	public ClientConnect() {
	}

	@Override
	public void run() {
		isRuning = true;
		while (isRuning) {
			try {
				System.out.println("client connect accept");
				Socket accept = ss.accept();
				System.out.println("client address:" + accept.getInetAddress().getHostAddress());
				// 初始化Client
				Client client = new Client(accept);
				client.connect();
				// 添加到管理中
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	public void close() {
		isRuning = false;
		this.interrupt();
	}

	public void initServerSocket() throws IOException {
		try {
			ss = new ServerSocket(8999);
		} catch (IOException e) {
			// 初始化失败
			e.printStackTrace();
			throw e;
		}

	}

}
