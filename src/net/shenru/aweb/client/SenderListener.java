package net.shenru.aweb.client;

import net.shenru.aweb.client.Client.Status;

public class SenderListener {

	public void update(Sender s, Object arg) {
		System.out.println("SenderListener update:" + s.getStatus());
		if (s.getStatus() == Status.NEW) {
			// 创建
		} else if (s.getStatus() == Status.WAITING) {
			// 等待
			// TODO 应该为请求通知不应手动设置
			Client client = s.getClient();
			Receiver receiver = client.getReceiver();
			if (receiver != null && receiver.getStatus() == Status.WAITING) {
				client.setStatus(Status.WAITING);
			}
		} else if (s.getStatus() == Status.TERMINATED) {
			// 客户端断开
		} else if (s.getStatus() == Status.CLOSE) {
			// 关闭
		}
//		Sender sender = s;
//		if (sendes.getSenderStatus() == Status.WAITING) {
//			if (sendes.getClient().getToken() == null) {
//				// 发送who
//				WhoTaskServlet wts = new WhoTaskServlet();
//				wts.send(sendes.getClient());
//			}
//		}
	}
}
