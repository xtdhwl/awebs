package net.shenru.aweb.client;

import java.io.IOException;
import java.io.OutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import net.shenru.aweb.exception.NoClientException;
import net.shenru.aweb.task.TaskQueue;
import net.shenru.aweb.util.PortAlloc;

/**
 * @ClassName: Pipe
 * @Description: 通道工
 * @author luql
 * @date 2014-2-20 下午09:39:02
 */
public class Piper {

	/** 没有客户端超时时间为1分20秒 */
	protected static final int TIMEOUT = 1000 * 80;
	/** 通道端口 */
	private int port = -1;
	private OutputStream outputStream;
	/** 写标示 */
	private boolean isWriteingFlag = true;
	// 由于通道异常种类不同，这里可以进行代码优化使用 enum来表示
	/*
	 * 这里出现的异常:没有客户端连接
	 * 发送流错误
	 * 接受流错误
	 * socker错误
	 */
	private boolean isNoClientException = false;
	private boolean isSocketException = false;
	private boolean isReadIOException = false;
	private boolean isWriteIOException = false;

	// private TaskQueue notifyer = new TaskQueue(10);
	private final Lock lock = new ReentrantLock();
	private final Condition piperWait = lock.newCondition();
	private TaskQueue<DataQueue> writer = new TaskQueue<DataQueue>(100);

	/** 数据包 */
	private class DataQueue {
		public DataQueue(byte[] data, int length) {
			this.data = data;
			this.length = length;
		}

		byte[] data;
		int length;

		public boolean isEnd() {
			return length == 0;
		}
	}

	public void setOutputStream(OutputStream os) {
		this.outputStream = os;
	}

	public int getPort() {
		return port;
	}

	/**
	 * 等待完成 如果没有用户或异常终端抛出异常
	 * 
	 * @throws InterruptedException 线程中断异常
	 * @throws NoClientException 没有客户端连接异常
	 * @throws IOException 流传输异常
	 * @param
	 * @return
	 */
	public void waitFinish() throws SocketException, NoClientException, IOException, InterruptedException {
		try {
			lock.lock();
			piperWait.await();
		} finally {
			lock.unlock();
		}
		if (isSocketException) {
			throw new SocketException();
		}
		if (isNoClientException) {
			throw new NoClientException();
		}
		if (isReadIOException) {
			throw new IOException();
		}
		if (isWriteIOException) {
			throw new IOException();
		}
	}

	public void init() {
		// 写一个线程，读一个线程考虑到使用udp连接，如果在写的时候堵塞，会影响读
		// read thread;
		new Thread(new Runnable() {
			@Override
			public void run() {
				DatagramSocket ds = null;
				try {
					ds = createDatagramSocket();
					ds.setSoTimeout(TIMEOUT);
					byte[] buf = new byte[64];
					DatagramPacket datagramPacket = new DatagramPacket(buf, buf.length);
					int length = -1;
					do {
						try {
							ds.receive(datagramPacket);
						} catch (IOException e) {
							// 接受失败
							e.printStackTrace();
							isReadIOException = true;
						}
						length = datagramPacket.getLength();
						System.out.println("piper read length : " + length);
						if (isReadIOException) {
							try {
								writer.add(new DataQueue(null, 0));
							} catch (InterruptedException e) {
								e.printStackTrace();
								isWriteingFlag = false;
							}
						} else {
							try {
								byte[] destBuf = new byte[length];
								System.arraycopy(buf, 0, destBuf, 0, length);
								writer.add(new DataQueue(destBuf, length));
							} catch (InterruptedException e) {
								e.printStackTrace();
								isWriteingFlag = false;
							}
						}
						// 接受正常 读取正常 读取字节大于0
					} while (isWriteingFlag && !isReadIOException && !isWriteIOException && length > 0);
				} catch (SocketException e) {
					// 端口被占用或初始化失败
					e.printStackTrace();
					isSocketException = true;
				}
				notifyFinish();

				// 释放资源
				if (ds != null) {
					try {
						ds.close();
					} catch (Exception e) {
						// TODO: handle exception
					}
				}
			}

			private DatagramSocket createDatagramSocket() throws SocketException {
				DatagramSocket d = null;
				int tryCount = 3;
				SocketException _e = null;
				do {
					int p = PortAlloc.alloc();
					try {
						d = new DatagramSocket(new InetSocketAddress(p));
						port = p;
					} catch (SocketException e) {
						_e = e;
						e.printStackTrace();
					}
					tryCount--;
				} while (d == null && tryCount > 0);
				if (d == null) {
					throw _e;
				}
				return d;
			}

		}).start();

		// write thread;
		new Thread(new Runnable() {

			@Override
			public void run() {
				try {
					while (isWriteingFlag) {
						DataQueue data = writer.poll(TIMEOUT, TimeUnit.MILLISECONDS);
						isWriteingFlag = data != null && outputStream != null;
						if (isWriteingFlag) {
							try {
								if (data.isEnd()) {
									isWriteingFlag = false;
									System.out.println("piper write end");
								} else {
									outputStream.write(data.data, 0, data.length);
									System.out.println("piper write length : " + data.length);
								}
							} catch (IOException e) {
								e.printStackTrace();
								isWriteingFlag = false;
							}
						}
					}

				} catch (InterruptedException e) {
					e.printStackTrace();
					isWriteingFlag = false;
					isReadIOException = true;
				}
			}
		}).start();

		try {
			// TODO 等待线程准备好
			Thread.sleep(100);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 通知完成
	 */
	private void notifyFinish() {
		int tryCount = 10;
		boolean isException = false;
		do {
			try {
				lock.lock();
				piperWait.signal();
				isException = false;
			} catch (Exception e) {
				e.printStackTrace();
				isException = true;
			} finally {
				lock.unlock();
				tryCount--;
			}

		} while (isException && tryCount > 0);
	}

}
