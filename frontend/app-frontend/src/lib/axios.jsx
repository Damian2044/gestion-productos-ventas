import axios from "axios";
const api=axios.create({
    baseURL: "http://localhost:8000"//"http://192.168.100.20:8000"//import.meta.env.VITE_API_URL 
});

export default api;