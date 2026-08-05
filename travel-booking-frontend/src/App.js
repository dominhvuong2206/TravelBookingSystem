import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Alert, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CompareBar from "./components/CompareBar";
import Home from "./screens/Home/Home";
import Register from "./screens/User/Register";
import Login from "./screens/User/Login";
import ServiceDetails from "./screens/Home/ServiceDetails";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import AdminRoute from "./components/routing/AdminRoute";
import ProviderRoute from "./components/routing/ProviderRoute";
import CustomerRoute from "./components/routing/CustomerRoute";
import UserManagement from "./screens/Admin/UserManagement";
import CategoryManagement from "./screens/Admin/CategoryManagement";
import AdminDashboard from "./screens/Admin/AdminDashboard";
import MyServices from "./screens/Provider/MyServices";
import ServiceForm from "./screens/Provider/ServiceForm";
import Booking from "./screens/Booking/Booking";
import MyBookings from "./screens/Booking/MyBookings";
import MyPayments from "./screens/Payment/MyPayments";
import ServiceBookings from "./screens/Provider/ServiceBookings";
import ProviderReviews from "./screens/Provider/ProviderReviews";
import ProviderStats from "./screens/Provider/ProviderStats";
import Compare from "./screens/Compare/Compare";
import Profile from "./screens/User/Profile";
import ProviderPayments from "./screens/Provider/ProviderPayments";
import AdminPayments from "./screens/Admin/AdminPayments";
import PaymentReturn from "./screens/Payment/PaymentReturn";
import TravelChat from "./components/chat/TravelChat";
import { ChatContext } from "./configs/Contexts";

const App = () => {
    const [chatRequest, setChatRequest] = useState(null);

    return <BrowserRouter>
        <ChatContext.Provider value={{
            openServiceChat: (service) => setChatRequest({ type: "service", service }),
            openBookingChat: (booking) => setChatRequest({ type: "booking", booking }),
        }}>
            <Header />
            <Container>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/services/:serviceId" element={<ServiceDetails />} />
                    <Route path="/services/:serviceId/book" element={<CustomerRoute><Booking /></CustomerRoute>} />
                    <Route path="/my-bookings" element={<CustomerRoute><MyBookings /></CustomerRoute>} />
                    <Route path="/my-payments" element={<CustomerRoute><MyPayments /></CustomerRoute>} />
                    <Route path="/payment-return/:method/:bookingId" element={<CustomerRoute><PaymentReturn /></CustomerRoute>} />
                    <Route path="/payment-return/:method" element={<CustomerRoute><PaymentReturn /></CustomerRoute>} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" /></AdminRoute>} />
                    <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                    <Route path="/admin/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
                    <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
                    <Route path="/provider/services" element={<ProviderRoute><MyServices /></ProviderRoute>} />
                    <Route path="/provider/services/add" element={<ProviderRoute><ServiceForm /></ProviderRoute>} />
                    <Route path="/provider/services/:serviceId/edit" element={<ProviderRoute><ServiceForm /></ProviderRoute>} />
                    <Route path="/provider/services/:serviceId/bookings" element={<ProviderRoute><ServiceBookings /></ProviderRoute>} />
                    <Route path="/provider/reviews" element={<ProviderRoute><ProviderReviews /></ProviderRoute>} />
                    <Route path="/provider/stats" element={<ProviderRoute><ProviderStats /></ProviderRoute>} />
                    <Route path="/provider/payments" element={<ProviderRoute><ProviderPayments /></ProviderRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/403" element={<Alert variant="danger" className="mt-3">Bạn không có quyền truy cập trang này.</Alert>} />
                </Routes>
            </Container>
            <Footer />
            <CompareBar />
            <TravelChat chatRequest={chatRequest} onHandled={() => setChatRequest(null)} />
        </ChatContext.Provider>
    </BrowserRouter>;
};

export default App;