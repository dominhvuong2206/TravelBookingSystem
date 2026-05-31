import axios from "axios";
import cookies from 'react-cookies'

export const endpoints = {
    'categories': '/categories',
    'products': '/products',
    'register': '/users',
    'login': '/login',
    'profile': '/secure/profile',
    'pay': '/secure/pay',
    'product-details': (productId) =>  `/products/${productId}`,
    'comments': (productId) => `/products/${productId}/comments`,
    'addComment': (productId) => `/secure/products/${productId}/comments`,
}

export const authApis = () => {
    console.info(cookies.load('token'))
    return axios.create({
        baseURL: "http://localhost:8080/SpringSaleAppV1/api/",
        headers: {
            'Authorization': `Bearer ${cookies.load('token')}`
        }
    })
}

export default axios.create({
    baseURL: "http://localhost:8080/SpringSaleAppV1/api/"
})