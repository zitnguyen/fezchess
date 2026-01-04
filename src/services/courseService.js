import axiosClient from '../api/axiosClient';

const courseService = {
  getAll: (params) => {
    return axiosClient.get('/courses', { params });
  },
  getById: (id) => {
    return axiosClient.get(`/courses/${id}`);
  },
  create: (data) => {
    return axiosClient.post('/courses', data);
  },
  update: (id, data) => {
    return axiosClient.put(`/courses/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/courses/${id}`);
  },
};

export default courseService;
