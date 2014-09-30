package net.shenru.aweb.client;

import java.io.IOException;

/**
 * @ClassName: ClientService
 * @Description: 客户端服务，负责启动、关闭、重启服务
 * @author luql
 * @date 2014-1-29 下午09:54:01
 */
public class ClientService {
	private static ClientService mInstance;
	private ClientConnect mClientConnect;
	private Statue statue;

	/** 服务器状态 */
	enum Statue {
		NEW, RUNING, STOP
	}

	private ClientService() {
		mClientConnect = new ClientConnect();
		statue = Statue.NEW;
	}

	public static ClientService getInstance() {
		if (mInstance == null) {
			mInstance = new ClientService();
		}
		return mInstance;
	}

	/**
	 * 启动服务
	 */
	public void start() {
		// TODO 如果当请为runing在调用start则报异常
		statue = Statue.RUNING;
		try {
			mClientConnect.initServerSocket();
			mClientConnect.start();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			statue = Statue.STOP;
		}

	}

	public boolean isRuning() {
		return statue == Statue.RUNING;
	}
}
