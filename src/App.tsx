import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import VoitureDetail from './pages/VoitureDetail';
import Admin from './pages/Admin';
import './App.css';

function AppShell() {
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  const isCatalogue = location.pathname === '/catalogue' || location.pathname === '/';

  return (
    <div className="min-h-screen bg-white">
      <Navbar searchValue={searchValue} onSearchChange={setSearchValue} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogue" element={<Catalogue searchValue={isCatalogue ? searchValue : ''} />} />
        <Route path="/voitures/:id" element={<VoitureDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
