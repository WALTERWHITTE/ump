import React, { useState } from 'react';

const AddClientForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    dob: '',
    profession: '',
    gender: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    const { name, email, contact, dob, profession, gender } = formData;

    // Basic validation
    if (!name.trim()) return setError('Client Name is required');
    if (!email.trim()) return setError('Client Email is required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError('Invalid email format');
    if (gender && !['Male', 'Female'].includes(gender)) return setError('Gender must be Male or Female');
    if (dob && isNaN(new Date(dob).getTime())) return setError('Invalid date of birth');
    if (contact && !/^\d+$/.test(contact)) return setError('Contact must contain only digits');

    const token = localStorage.getItem('token');
    if (!token) return setError('Unauthorized: Please login.');

    try {
      const response = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          contact: contact.trim() || null,
          dob: dob || null,
          profession: profession.trim() || null,
          gender: gender || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to add client.');

      setSuccess('✅ Client added successfully!');
      setFormData({
        name: '',
        email: '',
        contact: '',
        dob: '',
        profession: '',
        gender: '',
      });

      if (onSuccess) onSuccess(); // refresh client list if needed
      if (onClose) onClose();     // close modal or form
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-semibold">Add New Client</h2>

      {error && <p className="mb-2 text-red-600">{error}</p>}
      {success && <p className="mb-2 text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Client Name *"
          value={formData.clientName}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Client Email *"
          value={formData.clientEmail}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="tel"
          name="contact"
          placeholder="Contact Number"
          value={formData.clientContact}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="date"
          name="dob"
          value={formData.clientDob}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          name="profession"
          placeholder="Profession"
          value={formData.clientProfession}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />
        <select
          name="gender"
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
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClientForm;