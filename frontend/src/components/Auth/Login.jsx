import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const LoginContainer = styled.div`
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    label {
        font-weight: 500;
        color: #333;
    }
    
    input {
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        
        &:focus {
            outline: none;
            border-color: #0066b3;
            box-shadow: 0 0 0 2px rgba(0,102,179,0.2);
        }
    }
    
    .error {
        color: #dc3545;
        font-size: 0.9rem;
    }
`;

const CaptchaContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 5px;
    
    .captcha-text {
        font-family: 'Courier New', monospace;
        font-size: 1.5rem;
        font-weight: bold;
        letter-spacing: 2px;
        background: linear-gradient(45deg, #666, #333);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        padding: 0.5rem 1rem;
        border: 1px dashed #ccc;
    }
`;

const Button = styled.button`
    background: linear-gradient(135deg, #0066b3 0%, #003f7f 100%);
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,102,179,0.3);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
        captcha: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [captchaText] = useState('KMRL123'); // In production, generate dynamically
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.emailOrUsername.trim()) {
            newErrors.emailOrUsername = 'Email or Username is required';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        
        if (!formData.captcha) {
            newErrors.captcha = 'Captcha is required';
        } else if (formData.captcha !== captchaText) {
            newErrors.captcha = 'Incorrect captcha';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await axios.post('/api/auth/login', {
                emailOrUsername: formData.emailOrUsername,
                password: formData.password,
                captcha: formData.captcha
            });
            toast.success(response.data.message);
            onLogin(response.data.token, response.data.user);
            navigate('/');
        } catch (error) {
            // On failure, show server error (or generic) and do not auto-login using bundled/mock/local demo users
            const message = error.response?.data?.message || 'Login failed. Please try again later.';
            toast.error(message);
            if (error.response?.data?.errors) {
                const serverErrors = {};
                error.response.data.errors.forEach(err => {
                    serverErrors[err.param] = err.msg;
                });
                setErrors(serverErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LoginContainer>
            <h2>Login to KMRL Metro System</h2>
            <p>Enter your credentials to access AI-driven train planning</p>
            
            <Form onSubmit={handleSubmit}>
                <InputGroup>
                    <label>Email or Username *</label>
                    <input
                        type="text"
                        name="emailOrUsername"
                        value={formData.emailOrUsername}
                        onChange={handleChange}
                        placeholder="Enter email or username"
                    />
                    {errors.emailOrUsername && (
                        <span className="error">{errors.emailOrUsername}</span>
                    )}
                </InputGroup>
                
                <InputGroup>
                    <label>Password *</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                    />
                    {errors.password && (
                        <span className="error">{errors.password}</span>
                    )}
                </InputGroup>
                
                <InputGroup>
                    <label>Captcha Verification *</label>
                    <CaptchaContainer>
                        <div className="captcha-text">{captchaText}</div>
                        <input
                            type="text"
                            name="captcha"
                            value={formData.captcha}
                            onChange={handleChange}
                            placeholder="Enter captcha"
                            style={{ flex: 1 }}
                        />
                    </CaptchaContainer>
                    {errors.captcha && (
                        <span className="error">{errors.captcha}</span>
                    )}
                </InputGroup>
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>
            </Form>
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: '#0066b3', fontWeight: 'bold' }}>
                        Sign up here
                    </Link>
                </p>
            </div>
        </LoginContainer>
    );
};

export default Login;