// utils.js

import { fetchClients } from "../data/clients"; // Make sure this path is correct

export const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-500';
    case 'Pending':
      return 'bg-yellow-500';
    case 'Inactive':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

export const getLogStatusColor = (status) => {
  switch (status) {
    case 'Success':
      return 'bg-green-100 text-green-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Export fetchClients if you want to use it elsewhere from this file
export { fetchClients };
