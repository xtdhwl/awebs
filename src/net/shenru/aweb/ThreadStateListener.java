package net.shenru.aweb;

import net.shenru.aweb.client.Client.Status;


/**
 * @ClassName: ThreadStateListener
 * @Description: 线程状态监听
 * @author luql
 * @date 2014-1-29 下午09:23:36
 */
public interface ThreadStateListener {

	public void onStateChanage(Status state);
}
