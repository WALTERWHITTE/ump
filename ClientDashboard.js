import React, { useState, useEffect } from 'react';
import {
  Search, Users, Copy, Edit, Trash2, Plus, Bookmark
} from 'lucide-react';
import AddClientForm from './AddClientForm';
import ActionsMenu from './ActionsMenu';
import { fetchClients, updateClient, deleteClientById } from '../data/clients';
import logs from '../data/log';
import { getLogStatusColor } from '../utils/utils';

const ClientDashboard = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('clients');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await fetchClients(token);
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowAddForm(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const token = localStorage.getItem('token');
      await deleteClientById(token, clientId);
      setClients(prev => prev.filter(c => c.clientId !== clientId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete client.');
    }
  };

  const handleCopy = (client) => {
    const text = `
Client ID: ${client.clientId}
Name: ${client.clientName}
Email: ${client.clientEmail}
Contact: ${client.clientContact}
DOB: ${client.clientDob}
Profession: ${client.clientProfession}
Gender: ${client.clientGender}
Family ID: ${client.familyId}
Family Head: ${client.familyHead}
Created At: ${client.createdAt}
Updated At: ${client.updatedAt}
    `;
    navigator.clipboard.writeText(text).catch(console.error);
  };

  const handleFormSubmit = async (formClient) => {
  const token = localStorage.getItem('token');
  const payload = {
    name: formClient.clientName,
    email: formClient.clientEmail,
    contact: formClient.clientContact,
    dob: formClient.clientDob
      ? new Date(formClient.clientDob).toISOString().split('T')[0]
      : null,
    profession: formClient.clientProfession,
    gender: formClient.clientGender,
  };

  try {
    if (editingClient) {
      await updateClient(token, editingClient.clientId, payload);
    } else {
      // If adding client, you should ideally call a `createClient` API here.
      // For now, we're just reloading the list.
    }

    // Always refresh the entire client list from the server
    const updatedClientList = await fetchClients(token);
    setClients(updatedClientList);
  } catch (err) {
    console.error('Submit error:', err);
    alert('Failed to save client.');
  } finally {
    setShowAddForm(false);
    setEditingClient(null);
  }
};


  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.clientName?.toLowerCase().includes(term) ||
      c.clientEmail?.toLowerCase().includes(term) ||
      String(c.clientContact || '').includes(term) ||
      String(c.clientId || '').includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => setIsActionsOpen(false)}>
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <AddClientForm
            onClose={() => {
              setShowAddForm(false);
              setEditingClient(null);
            }}
            onAddClient={handleFormSubmit}
            existingClient={editingClient}
          />
        </div>
      )}

      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Client Dashboard</h1>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingClient(null);
            }}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </div>

      <div className="p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="text-gray-500" size={20} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentView === 'logs' ? 'Database Logs' : 'Clients'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentView === 'logs' ? 'System activity and operations log' : 'Manage your clients'}
              </p>
            </div>
          </div>
          {currentView === 'clients' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 py-2 pl-10 pr-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <ActionsMenu
            isOpen={isActionsOpen}
            onToggle={() => setIsActionsOpen(!isActionsOpen)}
            onSelect={(view) => {
              setCurrentView(view);
              setIsActionsOpen(false);
            }}
          />
          <div
            className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800"
            onClick={() => setCurrentView('clients')}
          >
            <Bookmark size={16} />
            <span className="text-sm">Saved Clients</span>
          </div>
        </div>

        {currentView === 'logs' ? (
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Log ID', 'User ID', 'Timestamp', 'Action', 'Description', 'Username', 'Status'].map((h) => (
                      <th key={h} className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr key={log.logId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.logId}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.userId}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
                      <td className="px-6 py-4 text-sm text-blue-800">{log.action}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.username}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full ${getLogStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => (
                <div
                  key={client.clientId}
                  className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{client.clientName}</h3>
                        <button
                          onClick={() => handleCopy(client)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{client.clientEmail}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
                    {[
                      ['Client ID', client.clientId],
                      ['Contact', client.clientContact],
                      ['DOB', new Date(client.clientDob).toLocaleDateString()],
                      ['Gender', client.clientGender],
                      ['Profession', client.clientProfession],
                      ['Family ID', client.familyId],
                      ['Family Head', client.familyHead],
                      ['Created At', new Date(client.createdAt).toLocaleString()],
                      ['Updated At', new Date(client.updatedAt).toLocaleString()],
                    ].map(([label, value]) => (
                      <div className="flex gap-1 truncate" key={label}>
                        <span className="text-xs text-gray-500">{label}:</span>
                        <span className="text-xs text-gray-700 truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleEdit(client)}
                      className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.clientId)}
                      className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredClients.length === 0 && (
              <div className="py-12 text-center text-gray-500">No clients found.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
