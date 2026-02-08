import axios from "axios";
const axiosInstance=axios.create({
    baseURL:"http://localhost:8000/",
    withCredentials: true, // 🔑 VERY IMPORTAN
})
export default axiosInstance;