import axios from 'axios';

const API_URL = `http://localhost/api`;

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    maxBodyLength: 10000 * 1024,
    maxContentLength: 10000 * 1024
});

api.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
});

api.interceptors.response.use(config => {
    return config;
}, async error => {
    const originalRequest = error.config;
    if(error.response?.status === 401 && error.config && !error.config._isRetry) { 
        originalRequest._isRetry = true;
        try{
            // const response = await axios.post(`${API_URL}/refresh`, {}, {withCredentials: true});
            const response = await api.get('/refresh');
            localStorage.setItem('token', response.data.accessToken);
            return api.request(originalRequest);
        }catch(e){
            console.log(e);
        }
    }
    throw error;
});