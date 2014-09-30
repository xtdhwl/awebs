package net.shenru.aweb.util;

import java.util.HashMap;
import java.util.Map;

public class ByteUtil {

	private static Map<Byte, String> byteToHex = new HashMap<Byte, String>();
	private static Map<String, Byte> hexToByte = new HashMap<String, Byte>();
	static {
		init();
	}

	private static void init(){
		byte b = -128;
		for (int i = 0; i <= 255; i++) {
			String s = bToH(b);
			byteToHex.put(b, s);
			hexToByte.put(s, b);
			System.out.println(b + ":" + s);
			b++;
		}
	}
	
	private static String bToH(byte b) {
		String hexString = Integer.toHexString(b);
		int length = hexString.length();
		if (length == 1) {
			hexString = "0" + hexString;
		} else if (length > 2) {
			hexString = hexString.substring(hexString.length() - 2, hexString.length());
		}
		return hexString;
	}
	
	public static String byteToHex(byte b) {
		if(byteToHex.isEmpty()){
			init();
		}
		String str = byteToHex.get(b);
		return str;
	}

	public static byte hexToByte(String hex) {
		if(hexToByte.isEmpty()){
			init();
		}
		Byte b = hexToByte.get(hex);
		return b;
	}
}
