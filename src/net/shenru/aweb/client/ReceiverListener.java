package net.shenru.aweb.client;

import net.shenru.aweb.client.Client.Status;

public class ReceiverListener {

	public void update(Receiver r, Object arg) {
		System.out.println("ReceiverListener update:" + r.getStatus());
		if (r.getStatus() == Status.NEW) {
			// 创建
		} else if (r.getStatus() == Status.WAITING) {
			// 等待
			// TODO 应该为请求通知不应手动设置
			Client client = r.getClient();
			Sender sender = client.getSender();
			if (sender != null && sender.getStatus() == Status.WAITING) {
				client.setStatus(Status.WAITING);
			}
		} else if (r.getStatus() == Status.TERMINATED) {
			// 客户端断开
			Client client = r.getClient();
			client.setStatus(Status.TERMINATED);
		} else if (r.getStatus() == Status.CLOSE) {
			// 关闭
		}
		// Receiver receiver = r;
		// if (receiver.getReceiverStatus() == Status.WAITING) {
		// // 发送who
		// WhoTaskServlet wts = new WhoTaskServlet();
		// wts.send(receiver.getClient());
		// }
	}

}
