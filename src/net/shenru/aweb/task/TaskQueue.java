package net.shenru.aweb.task;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.TimeUnit;

/**
 * 
 * @ClassName: TaskQueue
 * @Description: 任务队列
 * @author luql
 * @date 2014-1-27 下午11:36:43
 * @param <E>
 */
/**
 * 基于ArrayBlockingQueue的任务队列
 */
public class TaskQueue<E> {

	private ArrayBlockingQueue<E> mQueue;

	public TaskQueue(int capacity) {
		mQueue = new ArrayBlockingQueue<E>(capacity);
	}

	/**
	 * 清空列表
	 */
	public void clear() {
		mQueue.clear();
	}

	/**
	 * 是否包含元素
	 * 
	 * @param o
	 * @return
	 */
	public boolean contains(Object o) {
		return mQueue.contains(o);
	}

	/**
	 * 获取并移除此队列的头，如果此队列为空，则返回 null。
	 * 
	 * @param
	 * @return
	 */
	public E poll() {
		return mQueue.poll();
	}

	/**
	 * 获取并移除此队列的头部，在指定的等待时间前等待可用的元素（如果有必要）。
	 * 
	 * @param timeout
	 * @param unit
	 * @return
	 * @throws InterruptedException
	 */
	public E poll(long timeout, TimeUnit unit) throws InterruptedException {
		return mQueue.poll(timeout, unit);
	}

	/**
	 * 获取并移除此队列的头部，在元素变得可用之前一直等待（如果有必要）。
	 * 
	 * @return
	 * @throws InterruptedException
	 */
	public E take() throws InterruptedException {
		return mQueue.take();
	}

	/**
	 * 将指定的元素插入此队列的尾部，如果该队列已满，则等待可用的空间。
	 * 
	 * @param e
	 * @throws InterruptedException
	 */
	public void put(E e) throws InterruptedException {
		mQueue.put(e);
	}

	/**
	 * 添加元素
	 * 
	 * @param e
	 * @return
	 */
	public void add(E e) throws InterruptedException {
		mQueue.add(e);
	}

	/**
	 * 从此队列中移除指定元素的单个实例（如果存在）。
	 * 
	 * @param o
	 * @return
	 */
	public boolean remove(Object o) {
		return mQueue.remove(o);
	}

	/**
	 * 返回此队列中元素的数量。
	 * 
	 * @return
	 */
	public int size() {
		return mQueue.size();
	}
}
