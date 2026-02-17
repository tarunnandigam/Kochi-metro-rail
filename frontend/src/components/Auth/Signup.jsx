import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const SignupContainer = styled.div`
    max-width: 500px;
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
        display: flex;
        justify-content: space-between;
        
        .requirement {
            font-size: 0.8rem;
            color: #666;
            font-weight: normal;
        }
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
    
    .success {
        color: #28a745;
        font-size: 0.9rem;
    }
`;

const PasswordRequirement = styled.div`
    margin-top: 0.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 5px;
    
    ul {
        margin: 0;
        padding-left: 1.5rem;
        
        li {
            margin: 0.3rem 0;
            font-size: 0.9rem;
            
            &.valid {
                color: #28a745;
                list-style-type: '✓ ';
            }
            
            &.invalid {
                color: #dc3545;
                list-style-type: '✗ ';
            }
        }
    }
`;

const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    input {
        width: auto;
    }
    
    label {
        font-weight: normal;
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

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        savePassword: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        };
        return requirements;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const nameRegex = /^[A-Za-z\s]+$/;
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (!nameRegex.test(formData.fullName)) {
            newErrors.fullName = 'Name should contain only letters and spaces';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        
        const passwordReqs = validatePassword(formData.password);
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!Object.values(passwordReqs).every(req => req)) {
            newErrors.password = 'Password does not meet requirements';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await axios.post('/api/auth/signup', {
                fullName: formData.fullName,
                email: formData.email,
                username: formData.username,
                password: formData.password
            });
            toast.success(response.data.message);
            navigate('/login');
            return;
        } catch (error) {
            // Do not create local demo users automatically on network failure.
            const message = error.response?.data?.message || 'Signup failed. Please try again later.';
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

    const passwordReqs = validatePassword(formData.password);

    return (
        <SignupContainer>
            <h2>Create KMRL Metro Account</h2>
            <p>Register to access AI-driven train planning and scheduling</p>
            
            <Form onSubmit={handleSubmit}>
                <InputGroup>
                    <label>
                        Full Name (as per Aadhar) *
                        <span className="requirement">Letters and spaces only</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                        <span className="error">{errors.fullName}</span>
                    )}
                </InputGroup>
                
                <InputGroup>
                    <label>Email ID *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />
                    {errors.email && (
                        <span className="error">{errors.email}</span>
                    )}
                </InputGroup>
                
                <InputGroup>
                    <label>Username *</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                    />
                    {errors.username && (
                        <span className="error">{errors.username}</span>
                    )}
                </InputGroup>
                
                <InputGroup>
                    <label>Password *</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                    />
                    {errors.password && (
                        <span className="error">{errors.password}</span>
                    )}
                    
                    <PasswordRequirement>
                        <p>Password must contain:</p>
                        <ul>
                            <li className={passwordReqs.length ? 'valid' : 'invalid'}>
                                At least 8 characters
                            </li>
                            <li className={passwordReqs.uppercase ? 'valid' : 'invalid'}>
                                At least one uppercase letter
                            </li>
                            <li className={passwordReqs.lowercase ? 'valid' : 'invalid'}>
                                At least one lowercase letter
                            </li>
                            <li className={passwordReqs.number ? 'valid' : 'invalid'}>
                                At least one number
                            </li>
                            <li className={passwordReqs.special ? 'valid' : 'invalid'}>
                                At least one special character (@$!%*?&)
                            </li>
                        </ul>
                    </PasswordRequirement>
                </InputGroup>
                
                <InputGroup>
                    <label>Confirm Password *</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                    />
                    {errors.confirmPassword && (
                        <span className="error">{errors.confirmPassword}</span>
                    )}
                </InputGroup>
                
                <CheckboxGroup>
                    <input
                        type="checkbox"
                        name="savePassword"
                        checked={formData.savePassword}
                        onChange={handleChange}
                        id="savePassword"
                    />
                    <label htmlFor="savePassword">
                        Save password securely
                    </label>
                </CheckboxGroup>
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </Form>
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#0066b3', fontWeight: 'bold' }}>
                        Login here
                    </Link>
                </p>
            </div>
        </SignupContainer>
    );
};

export default Signup;