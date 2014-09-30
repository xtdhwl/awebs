package net.shenru.aweb.util;

/**
 * @ClassName: FileUtil
 * @Description: 文件工具类
 * @author luql
 * @date 2014-3-10 下午10:43:39
 */
public class FileUtil {

	public static String getFileName(String path) {
		int index = path.lastIndexOf("/");
		if (index == -1) {
			index = path.lastIndexOf("\\");
		}
		return path.substring(index + 1, path.length());
	}
}
