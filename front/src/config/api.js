import axios from 'axios';

export const BASE_URL = 'https://back-alielghazoly1-alielghazoly1s-projects.vercel.app';
// export const BASE_URL = 'http://localhost:4000';

/**
 * Axios instance مشتركة في كل المشروع
 * بدل ما كل ملف يعمل axios.create() لوحده
 */
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
