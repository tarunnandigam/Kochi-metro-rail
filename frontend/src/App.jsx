import React, { useState } from 'react';
import './App.css';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import SearchMetro from './pages/SearchMetro';
import Dashboard from './pages/Dashboard';
import FindMetro from './pages/FindMetro';
import TicketView from './pages/TicketView';
import Chatbot from './components/Chatbot/Chatbot';
import Recharge from './pages/Recharge';
import MyAccount from './pages/MyAccount';

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setIsLoggedIn(true);
        setUser(userData);
        setCurrentPage('home');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentPage('home');
    };

    // Pages that handle their own full-screen layout (auth pages)
    const authPages = ['signin', 'signup'];
    const isAuthPage = authPages.includes(currentPage);

    const renderPage = () => {
        switch (currentPage) {
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
            case 'recharge':
                return <Recharge onNavigate={setCurrentPage} />;
            case 'myaccount':
                return <MyAccount user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />;
            default:
                return <HomePage onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className="App">
            {/* Global Header — shown on all pages except auth pages */}
            {!isAuthPage && (
                <Header
                    isAuthenticated={isLoggedIn}
                    user={user}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    currentPage={currentPage}
                />
            )}
            <main className={!isAuthPage ? 'app-main' : ''}>
                {renderPage()}
            </main>
            <Chatbot />
        </div>
    );
}

export default App;