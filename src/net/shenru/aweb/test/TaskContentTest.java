package net.shenru.aweb.test;

import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

public class TaskContentTest {

	public static void main(String[] args) throws JSONException {
		// mapToJsonTest();
//		jsonToObjTestt();
		jsonArrayTest();
	}

	private static void jsonArrayTest() throws JSONException {
		JSONObject json = new JSONObject();
		JSONArray array = new JSONArray();
		json.put("method", "getClientList");
		json.put("result", array);
		for (int i = 0; i < 3; i++) {
			JSONObject jobj = new JSONObject();
			jobj.put("" + i, i);
			array.put(jobj);
		}
		System.out.println(json.toString());
	}

	private static void jsonToObjTestt() throws JSONException {
		String json = "{id:'1',content:{\"test\":\"haha\",\"test2\":\"haha2\"}}";
		JSONObject jobj = (JSONObject) new JSONTokener(json).nextValue();
		System.out.println(jobj.toString());
		JSONObject jobj1 = (JSONObject) jobj.get("content");
		JSONArray names = jobj1.names();
		for (int i = 0; i < names.length(); i++) {
			String name = (String) names.get(i);
			String value = jobj1.getString(name);

			System.out.println(name + "||" + value);
		}

	}

	private static void mapToJsonTest() throws JSONException {
		Map<String, String> maps = new HashMap<String, String>();
		maps.put("test", "haha");
		JSONObject jobj = new JSONObject();
		jobj.put("id", "1");
		JSONObject jobj1 = new JSONObject(maps);
		jobj.put("content", jobj1);
		System.out.println(jobj.toString());
	}

}
