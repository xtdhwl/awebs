package net.shenru.aweb.model;

public class FileVo {

	private int port;
	// 文件
	// file:///sdcard/aweb/test.txt >文件
	// device:/// >设备
	private String path;

	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

}
