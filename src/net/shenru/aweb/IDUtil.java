package net.shenru.aweb;

public class IDUtil {

	private static long id = System.currentTimeMillis();

	private IDUtil() {
	}

	public static synchronized long getUUID() {
		return id++;
	}
}
