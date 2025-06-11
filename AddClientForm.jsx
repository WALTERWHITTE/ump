import React, { useState, useEffect } from 'react';

const AddClientForm = ({ onClose, onAddClient, existingClient }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientContact: '',
    clientDob: '',
    clientProfession: '',
    clientGender: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (existingClient) {
      setFormData({
        clientName: existingClient.clientName || '',
        clientEmail: existingClient.clientEmail || '',
        clientContact: existingClient.clientContact !== null ? String(existingClient.clientContact) : '',
        clientDob: existingClient.clientDob ? existingClient.clientDob.split('T')[0] : '',
        clientProfession: existingClient.clientProfession || '',
        clientGender: existingClient.clientGender || '',
      });
    }
  }, [existingClient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const {
      clientName,
      clientEmail,
      clientContact,
      clientDob,
      clientProfession,
      clientGender,
    } = formData;

    // Validation
    if (!clientName.trim()) return setError('Client Name is required');
    if (!clientEmail.trim()) return setError('Client Email is required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) return setError('Invalid email format');
    if (clientGender && !['Male', 'Female'].includes(clientGender)) return setError('Gender must be Male or Female');
    if (clientDob && isNaN(new Date(clientDob).getTime())) return setError('Invalid date of birth');
    if (clientContact && !/^\d{10}$/.test(clientContact)) return setError('Contact must be a 10-digit number');

    const token = localStorage.getItem('token');
    if (!token) return setError('Unauthorized: Please login.');

    const clientPayload = {
      name: clientName.trim(),
      email: clientEmail.trim(),
      contact: clientContact ? String(clientContact).trim() : null,
      dob: clientDob || null,
      profession: clientProfession ? String(clientProfession).trim() : null,
      gender: clientGender || null,
    };

    const url = existingClient
      ? `http://localhost:3000/api/clients/${existingClient.clientId}`
      : 'http://localhost:3000/api/clients';
    const method = existingClient ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientPayload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Request failed');

      setSuccess(existingClient ? '✅ Client updated successfully!' : '✅ Client added successfully!');

      if (onAddClient) {
        const updatedClient = {
          clientId: existingClient?.clientId || result.clientId,
          clientName: clientPayload.name,
          clientEmail: clientPayload.email,
          clientContact: clientPayload.contact,
          clientDob: clientPayload.dob,
          clientProfession: clientPayload.profession,
          clientGender: clientPayload.gender,
        };

        console.log('[onAddClient] Sending to dashboard:', updatedClient);
        onAddClient(updatedClient);
      }

      onClose(); // Close modal
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-semibold">
        {existingClient ? 'Edit Client' : 'Add New Client'}
      </h2>

      {error && <p className="mb-2 text-red-600">{error}</p>}
      {success && <p className="mb-2 text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="clientName"
          placeholder="Client Name *"
          value={formData.clientName}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="email"
          name="clientEmail"
          placeholder="Client Email *"
          value={formData.clientEmail}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="tel"
          name="clientContact"
          placeholder="Contact Number"
          value={formData.clientContact}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="date"
          name="clientDob"
          value={formData.clientDob}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          name="clientProfession"
          placeholder="Profession"
          value={formData.clientProfession}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />
        <select
          name="clientGender"
          value={formData.clientGender}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">
            {existingClient ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClientForm;
