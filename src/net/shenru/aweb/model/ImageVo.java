package net.shenru.aweb.model;

/**
 * @ClassName: ImageVo
 * @Description: 图片
 * @author luql
 * @date 2014-3-6 下午04:29:55
 */
public class ImageVo {

	private int sizeWidth;
	private int sizeHeight;
//	private String size;
	private String path;
	private String type;

	public int getSizeWidth() {
		return sizeWidth;
	}

	public void setSizeWidth(int sizeWidth) {
		this.sizeWidth = sizeWidth;
	}

	public int getSizeHeight() {
		return sizeHeight;
	}

	public void setSizeHeight(int sizeHeight) {
		this.sizeHeight = sizeHeight;
	}

//	public String getSize() {
//		return getSizeWidth() + "*" + getSizeHeight();
//	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

}
