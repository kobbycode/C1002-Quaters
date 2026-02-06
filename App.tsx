
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import About from './pages/About';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <SiteProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </SiteProvider>
  );
};

export default App;
