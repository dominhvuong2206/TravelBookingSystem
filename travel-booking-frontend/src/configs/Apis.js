import axios from "axios";
import cookies from 'react-cookies'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/TravelBookingSystem/api/";

export const endpoints = {
    'categories': '/categories',
    'products': '/services',
    'products-count': '/services/count',
    'register': '/users',
    'login': '/login',
    'profile': '/secure/profile',
    'update-profile': '/secure/profile',
    'product-details': (productId) =>  `/services/${productId}`,
    'comments': (productId) => `/services/${productId}/comments`,
    'comments-count': (productId) => `/services/${productId}/comments/count`,
    'rating-summary': (productId) => `/services/${productId}/rating-summary`,
    'addComment': (productId) => `/secure/services/${productId}/comments`,
    'provider-reviews': '/secure/provider/reviews',
    'provider-reply-review': (reviewId) => `/secure/provider/reviews/${reviewId}/reply`,
    'provider-stats-summary': '/secure/provider/stats/summary',
    'provider-stats-revenue': '/secure/provider/stats/revenue',
    'provider-stats-revenue-quarter': '/secure/provider/stats/revenue/quarter',
    'provider-stats-revenue-year': '/secure/provider/stats/revenue/year',
    'provider-stats-services': '/secure/provider/stats/services',
    'admin-users': '/secure/admin/users',
    'admin-users-count': '/secure/admin/users/count',
    'admin-categories': '/secure/admin/categories',
    'admin-categories-count': '/secure/admin/categories/count',
    'admin-category-update': (categoryId) => `/secure/admin/categories/${categoryId}`,
    'admin-toggle-category-active': (categoryId) => `/secure/admin/categories/${categoryId}/toggle-active`,
    'admin-pending-providers': '/secure/admin/users/pending-providers',
    'admin-pending-providers-count': '/secure/admin/users/pending-providers/count',
    'admin-approve-user': (userId) => `/secure/admin/users/${userId}/approve`,
    'admin-toggle-user-active': (userId) => `/secure/admin/users/${userId}/toggle-active`,
    'admin-stats-summary': '/secure/admin/stats/summary',
    'admin-stats-revenue': '/secure/admin/stats/revenue',
    'admin-stats-revenue-quarter': '/secure/admin/stats/revenue/quarter',
    'admin-stats-revenue-year': '/secure/admin/stats/revenue/year',
    'admin-stats-services': '/secure/admin/stats/services',
    'admin-stats-booking-frequency': '/secure/admin/stats/booking-frequency',
    'admin-stats-booking-frequency-quarter': '/secure/admin/stats/booking-frequency/quarter',
    'admin-stats-booking-frequency-year': '/secure/admin/stats/booking-frequency/year',
    'provider-services': '/secure/provider/services',
    'provider-services-count': '/secure/provider/services/count',
    'provider-service-details': (serviceId) => `/services/${serviceId}`,
    'provider-service-update': (serviceId) => `/secure/provider/services/${serviceId}`,
    'provider-service-delete': (serviceId) => `/secure/provider/services/${serviceId}`,
    'provider-service-toggle-status': (serviceId) => `/secure/provider/services/${serviceId}/toggle-status`,
    'provider-service-bookings': (serviceId) => `/secure/provider/services/${serviceId}/bookings`,
    'provider-confirm-booking': (bookingId) => `/secure/provider/bookings/${bookingId}/confirm`,
    'provider-cancel-booking': (bookingId) => `/secure/provider/bookings/${bookingId}/cancel`,
    'provider-mark-booking-paid': (bookingId) => `/secure/provider/bookings/${bookingId}/mark-paid`,
    'bookings': '/secure/bookings',
    'bookings-count': '/secure/bookings/count',
    'booking-details': (bookingId) => `/secure/bookings/${bookingId}`,
    'cancel-booking': (bookingId) => `/secure/bookings/${bookingId}/cancel`,
    'payments': '/secure/payments',
    'payments-count': '/secure/payments/count',
    'provider-payments': '/secure/provider/payments',
    'provider-payments-count': '/secure/provider/payments/count',
    'provider-mark-payment-paid': (transactionId) => `/secure/provider/payments/${transactionId}/mark-paid`,
    'admin-payments': '/secure/admin/payments',
    'admin-payments-count': '/secure/admin/payments/count',
    'admin-mark-payment-paid': (transactionId) => `/secure/admin/payments/${transactionId}/mark-paid`,
    'stripe-create': '/secure/payments/stripe/create',
    'stripe-confirm': '/secure/payments/stripe/confirm',
    'paypal-create': '/secure/payments/paypal/create',
    'paypal-capture': '/secure/payments/paypal/capture',
    'momo-create': '/secure/payments/momo/create',
    'zalopay-create': '/secure/payments/zalopay/create',
}

export const authApis = (accessToken = null) => {
    const token = accessToken || cookies.load('token') || localStorage.getItem("token");

    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: API_BASE_URL
})
