import React, { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import SearchMetro from './pages/SearchMetro';
import Dashboard from './pages/Dashboard';
import FindMetro from './pages/FindMetro';
import TicketView from './pages/TicketView';
import Chatbot from './components/Chatbot/Chatbot';

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setIsLoggedIn(true);
        setUser(userData);
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentPage('home');
    };

    const renderPage = () => {
        switch(currentPage) {
            case 'home':
                return <HomePage onNavigate={setCurrentPage} />;
            case 'signup':
                return <SignUp onNavigate={setCurrentPage} />;
            case 'signin':
                return <SignIn onNavigate={setCurrentPage} onLogin={handleLogin} />;
            case 'dashboard':
                return <Dashboard user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />;
            case 'findmetro':
                return <FindMetro user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />;
            case 'ticket':
                return <TicketView onNavigate={setCurrentPage} />;
            case 'search':
                return <SearchMetro onLogout={handleLogout} user={user} onNavigate={setCurrentPage} />;
            default:
                return <HomePage onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className="App">
            {renderPage()}
            <Chatbot />
        </div>
    );
}

export default App;