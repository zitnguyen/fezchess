import axiosClient from '../api/axiosClient';

const classService = {
  getAll: (params) => {
    return axiosClient.get('/classes', { params });
  },
  getById: (id) => {
    return axiosClient.get(`/classes/${id}`);
  },
  create: (data) => {
    return axiosClient.post('/classes', data);
  },
  update: (id, data) => {
    return axiosClient.put(`/classes/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/classes/${id}`);
  },
};

export default classService;
