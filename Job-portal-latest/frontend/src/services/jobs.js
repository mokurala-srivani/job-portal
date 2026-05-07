import api from './api';

export const listJobs = (params) => api.get('/jobs', { params }).then((r) => r.data);
export const getJob = (id) => api.get(`/jobs/${id}`).then((r) => r.data);
export const createJob = (data) => api.post('/jobs', data).then((r) => r.data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data).then((r) => r.data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`).then((r) => r.data);
export const myPostedJobs = () => api.get('/jobs/mine/posted').then((r) => r.data);

export const toggleSavedJob = (jobId) => api.post(`/users/saved/${jobId}`).then((r) => r.data);
export const savedJobs = () => api.get('/users/saved').then((r) => r.data);
