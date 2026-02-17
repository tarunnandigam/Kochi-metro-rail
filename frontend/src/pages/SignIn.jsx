import React, { useState, useEffect } from 'react';
import { generateCaptcha, generateCaptchaImage } from '../utils/captcha';
import '../styles/SignIn.css';
import VideoBackground from '../components/VideoBackground';

function SignIn({ onNavigate, onLogin }) {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
        captcha: ''
    });

    const [captcha, setCaptcha] = useState('');
    const [captchaImage, setCaptchaImage] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        generateNewCaptcha();
    }, []);

    const generateNewCaptcha = () => {
        const newCaptcha = generateCaptcha();
        setCaptcha(newCaptcha);
        setCaptchaImage(generateCaptchaImage(newCaptcha));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.usernameOrEmail.trim()) {
            newErrors.usernameOrEmail = 'Username or email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        if (!formData.captcha.trim()) {
            newErrors.captcha = 'Please enter CAPTCHA';
        } else if (formData.captcha.toLowerCase() !== captcha.toLowerCase()) {
            newErrors.captcha = 'CAPTCHA is incorrect';
            generateNewCaptcha();
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailOrUsername: formData.usernameOrEmail,
                    password: formData.password,
                    captcha: formData.captcha
                })
            });

            // handle server error: try local/mock demo users first, otherwise show server message
            if (!response.ok) {
                // try fallback to local demo users
                try {
                    const demoUsers = JSON.parse(localStorage.getItem('kmrl_demo_users') || '[]');
                    const found = demoUsers.find(u => (u.email === formData.usernameOrEmail || u.username === formData.usernameOrEmail) && u.password === formData.password);
                    if (found) {
                        const user = { id: found.id || 'demo-' + found.username, fullName: found.fullName, email: found.email, username: found.username, userType: found.userType || 'customer' };
                        localStorage.setItem('kmrl_token', 'demo-token');
                        localStorage.setItem('kmrl_user', JSON.stringify(user));
                        onLogin(user);
                        setLoading(false);
                        return;
                    }
                } catch (e) { /* ignore */ }

                // try bundled mock users JSON
                try {
                    const resp = await fetch('/mock-api/users.json');
                    if (resp.ok) {
                        const users = await resp.json();
                        const u = users.find(x => (x.email === formData.usernameOrEmail || x.username === formData.usernameOrEmail) && x.password === formData.password);
                        if (u) {
                            const user = { id: u.id, fullName: u.fullName, email: u.email, username: u.username, userType: u.userType || 'customer' };
                            localStorage.setItem('kmrl_token', 'demo-token');
                            localStorage.setItem('kmrl_user', JSON.stringify(user));
                            onLogin(user);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (e) { /* ignore */ }

                const data = await response.json().catch(() => ({}));
                const errorMessage = data.message || data.errors?.[0]?.msg || 'Sign in failed';
                setErrors({ submit: errorMessage || 'Sign in failed. Please try again.' });
                setLoading(false);
                return;
            }

            const data = await response.json();

            // Successful server login
            localStorage.setItem('kmrl_token', data.token);
            localStorage.setItem('kmrl_user', JSON.stringify(data.user));
            onLogin(data.user);

        } catch (error) {
            console.error('Sign in error:', error);
            // Network error — try local demo users and bundled mock users to allow offline signin
            try {
                const demoUsers = JSON.parse(localStorage.getItem('kmrl_demo_users') || '[]');
                const found = demoUsers.find(u => (u.email === formData.usernameOrEmail || u.username === formData.usernameOrEmail) && u.password === formData.password);
                if (found) {
                    const user = { id: found.id || 'demo-' + found.username, fullName: found.fullName, email: found.email, username: found.username, userType: found.userType || 'customer' };
                    localStorage.setItem('kmrl_token', 'demo-token');
                    localStorage.setItem('kmrl_user', JSON.stringify(user));
                    onLogin(user);
                    setLoading(false);
                    return;
                }
            } catch (e) { /* ignore */ }

            try {
                const resp = await fetch('/mock-api/users.json');
                if (resp.ok) {
                    const users = await resp.json();
                    const u = users.find(x => (x.email === formData.usernameOrEmail || x.username === formData.usernameOrEmail) && x.password === formData.password);
                    if (u) {
                        const user = { id: u.id, fullName: u.fullName, email: u.email, username: u.username, userType: u.userType || 'customer' };
                        localStorage.setItem('kmrl_token', 'demo-token');
                        localStorage.setItem('kmrl_user', JSON.stringify(user));
                        onLogin(user);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) { /* ignore */ }

            setErrors({ submit: 'Unable to reach server. If you created a local demo account previously, use that. Or try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-container page-content-above-video">
            <VideoBackground src="/images/oip2.mp4" poster="/images/oip2.jpg" overlayOpacity={0.5} />
            <div className="signin-box">
                <div className="signin-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to KMRL Metro</p>
                </div>

                <form onSubmit={handleSubmit} className="signin-form">
                    {errors.submit && <div className="error-message">{errors.submit}</div>}

                    <div className="form-group">
                        <label htmlFor="usernameOrEmail">Username or Email *</label>
                        <input
                            type="text"
                            id="usernameOrEmail"
                            name="usernameOrEmail"
                            value={formData.usernameOrEmail}
                            onChange={handleInputChange}
                            placeholder="Enter username or email"
                            className={errors.usernameOrEmail ? 'input-error' : ''}
                        />
                        {errors.usernameOrEmail && <span className="error-text">{errors.usernameOrEmail}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                className={errors.password ? 'input-error' : ''}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label>CAPTCHA *</label>
                        <div className="captcha-section">
                            <div className="captcha-image-wrapper">
                                {captchaImage && <img src={captchaImage} alt="CAPTCHA" />}
                                <button
                                    type="button"
                                    className="refresh-captcha"
                                    onClick={generateNewCaptcha}
                                    title="Refresh CAPTCHA"
                                >
                                    🔄
                                </button>
                            </div>
                            <input
                                type="text"
                                name="captcha"
                                value={formData.captcha}
                                onChange={handleInputChange}
                                placeholder="Enter CAPTCHA"
                                maxLength="6"
                                className={`captcha-input ${errors.captcha ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.captcha && <span className="error-text">{errors.captcha}</span>}
                    </div>

                    <button type="submit" className="btn-signin-submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <p className="signup-link">
                        Don't have an account? <a href="#" onClick={() => onNavigate('signup')}>Sign Up</a>
                    </p>

                    <p className="forgot-password">
                        <a href="#" onClick={() => alert('Password reset feature coming soon!')}>Forgot password?</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SignIn;
