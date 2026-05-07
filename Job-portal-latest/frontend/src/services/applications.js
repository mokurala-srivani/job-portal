import api from './api';

export const apply = ({ jobId, resume, coverLetter }) => {
  const fd = new FormData();
  fd.append('jobId', jobId);
  fd.append('resume', resume);
  if (coverLetter) fd.append('coverLetter', coverLetter);
  return api.post('/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export const myApplications = () => api.get('/applications/me').then((r) => r.data);
export const applicantsForJob = (jobId) => api.get(`/applications/job/${jobId}`).then((r) => r.data);
export const updateApplicationStatus = (id, status) =>
  api.patch(`/applications/${id}/status`, { status }).then((r) => r.data);
