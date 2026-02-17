import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
    background: linear-gradient(135deg, #0066b3 0%, #003f7f 100%);
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    
    h1 {
        font-size: 1.5rem;
        margin: 0;
        background: linear-gradient(45deg, #fff, #b3e0ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .logo-img {
        width: 50px;
        height: 50px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: #0066b3;
    }
`;

const Nav = styled.nav`
    display: flex;
    gap: 2rem;
    align-items: center;
    
    a {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        transition: all 0.3s;
        
        &:hover {
            background: rgba(255,255,255,0.1);
        }
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .user-avatar {
            width: 40px;
            height: 40px;
            background: white;
            color: #0066b3;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
    }
`;

const Header = ({ isAuthenticated, user, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <HeaderContainer>
            <Logo>
                <div className="logo-img">KMRL</div>
                <h1>Kochi Metro Rail Limited</h1>
            </Logo>
            
            <Nav>
                <Link to="/">Home</Link>
                
                {isAuthenticated ? (
                    <>
                        <Link to="/search">Route Search</Link>
                        <Link to="/fare">Fare Calculator</Link>
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div>Welcome, {user?.fullName}</div>
                                <button 
                                    onClick={handleLogout}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid white',
                                        color: 'white',
                                        padding: '0.2rem 0.8rem',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign Up</Link>
                    </>
                )}
            </Nav>
        </HeaderContainer>
    );
};

export default Header;