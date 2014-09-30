package net.shenru.aweb.client;

import java.util.ArrayList;
import java.util.List;

import net.shenru.aweb.client.Client.Status;

public class ClientManager {

	private static ClientManager mInstance;
	private List<Client> clients;

	private ClientManager() {
		clients = new ArrayList<Client>();
	}

	public static ClientManager getInstance() {
		if (mInstance == null) {
			mInstance = new ClientManager();
		}
		return mInstance;
	}

	public Client getClientByToken(String token) {
		if (token == null) {
			return null;
		}
		for (Client c : clients) {
			String cToken = c.getToken();
			if (cToken.equals(token)) {
				return c;
			}
		}
		return null;
	}

	public void addClient(Client client) {
		clients.add(client);
	}

	public boolean removeClient(Client client) {
		return clients.remove(client);
	}

	public List<Client> getClientsByStatue(Status status) {
		List<Client> cs = new ArrayList<Client>();
		for (Client c : clients) {
			if (c.getStatus() == status) {
				cs.add(c);
			}
		}
		return cs;
	}

}
