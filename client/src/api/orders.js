import api from './client';

export const login = (login, password) => api.post('/login', { login, password });

export const fetchOrders = (params) => api.get('/orders', { params });

export const fetchOrder = (id) => api.get(`/orders/${id}`);

export const createOrder = (data) => api.post('/orders', data);

export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);

export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export const duplicateOrder = (id) => api.post(`/orders/${id}/duplicate`);

export const getUploadSignature = () => api.post('/upload-signature');

export const exportCsv = () =>
  api.get('/export/csv', { responseType: 'blob' }).then((res) => {
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
