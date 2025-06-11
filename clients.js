// clients.js
const API_BASE_URL = 'http://localhost:3000';

export const fetchClients = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized: Please log in.');

  const response = await fetch(`${API_BASE_URL}/api/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Log status and raw text
  const raw = await response.text();
  console.log('Response status:', response.status);
  console.log('Raw response:', raw);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${raw}`);
  }

  // Only parse JSON if there is content
  if (!raw) return [];
  return JSON.parse(raw);
};

export async function deleteClientById(token, clientId) {
  const res = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete client');
  return res.json();
}

export async function updateClient(token, clientId, updatedData) {
  console.log('[updateClient] Sending update for ID:', clientId);
  console.log('[updateClient] Data:', updatedData);

  const res = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  const result = await res.json();
  console.log('[updateClient] Response:', result);

  if (!res.ok) throw new Error(result.message || 'Failed to update client');
  return result;
}
