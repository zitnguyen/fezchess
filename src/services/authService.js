import axiosClient from '../api/axiosClient';

const authService = {
  login: async (credentials) => {
    // credentials: { username, password }
    const response = await axiosClient.post('/users/login', credentials);
    if (response) {
      localStorage.setItem('user', JSON.stringify(response));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;
