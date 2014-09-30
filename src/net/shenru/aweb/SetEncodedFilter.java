package net.shenru.aweb;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

public class SetEncodedFilter implements Filter {

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse res, FilterChain chain) throws IOException,
			ServletException {
		
		request.setCharacterEncoding("UTF-8");
//		System.out.println("filter request encoding:" + request.getCharacterEncoding());
		
		HttpServletResponse response = (HttpServletResponse) res;
		response.setContentType("text/html; charset=UTF-8");
		response.setCharacterEncoding("UTF-8");
		//TODO 客户端没有缓存
//		response.addHeader("Cache-Control", "no-cache");
//		response.addHeader("Pragma", "no-cache");
//		response.addHeader("max-age", "0");
		chain.doFilter(request, response);
	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub
		
	}

	
	

}
