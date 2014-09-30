package net.shenru.aweb.client;

import net.shenru.aweb.client.Client.Status;
import net.shenru.aweb.taskservlet.WhoTaskServlet;

/**
 * @ClassName: ClientObserver
 * @Description: 监控客户端状态改变(1监听2信号量3观察者4mvvm)
 * @author luql
 * @date 2014-1-30 上午11:06:17
 */
public class ClientListener {

	public void update(Client c, Object arg) {
		System.out.println("ClientListener update:" + c.getStatus());
		if (c.getStatus() == Status.NEW) {
			// 创建
			ClientManager.getInstance().addClient(c);
		} else if (c.getStatus() == Status.WAITING) {
			// 等待
			WhoTaskServlet who = new WhoTaskServlet();
			who.send(c);
		} else if (c.getStatus() == Status.TERMINATED) {
			// 客户端断开
			c.close();
		} else if (c.getStatus() == Status.CLOSE) {
			// 关闭
			ClientManager.getInstance().removeClient(c);
		}
	}
}
