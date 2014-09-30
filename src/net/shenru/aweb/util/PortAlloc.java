package net.shenru.aweb.util;

import java.util.HashMap;
import java.util.Map;

/**
 * @ClassName: PortAlloc
 * @Description: 端口分配器记录端口,使用完毕必须归还.-1代表无效端口
 * @author luql
 * @date 2014-2-20 下午10:45:03
 */
public class PortAlloc {
	private static final int start_port = 30000;
	private static final int end_port = 40000;

	private static Map<Integer, Boolean> ports = new HashMap<Integer, Boolean>();
	private static int guard = start_port;
	private static byte guard_count = 0;

	static {
		for (int i = start_port; i < end_port; i++) {
			ports.put(i, true);
		}
	}

	public static int alloc() {
		guard++;
		if (guard >= end_port) {
			guard_count++;
			guard = start_port;
		}
		Boolean b = ports.get(guard);
		if (b) {
			guard_count = 0;
			ports.put(guard, false);
			return guard;
		}

		if (guard_count > 1) {
			guard_count = 0;
			return -1;
		}

		return alloc();
	}

	public static void release(int port) {
		ports.put(port, true);
	}

	public static boolean isAvailable(int port) {
		return false;
	}
}
