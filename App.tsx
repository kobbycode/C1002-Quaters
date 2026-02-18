import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import { ToastProvider } from './context/ToastContext';
import { Toast } from './components/Toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import About from './pages/About';
import Wishlist from './pages/Wishlist';
import Amenities from './pages/Amenities';
import Admin from './pages/Admin';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import { AuthGuard } from './components/AuthGuard';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <SiteProvider>
          <Router>
            <Toast />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomDetail />} />
                <Route path="/checkout" element={
                  <AuthGuard>
                    <Checkout />
                  </AuthGuard>
                } />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/amenities" element={<Amenities />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                } />
                <Route
                  path="/admin"
                  element={
                    <AuthGuard requireAdmin>
                      <Admin />
                    </AuthGuard>
                  }
                />
              </Routes>
            </Layout>
          </Router>
        </SiteProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
