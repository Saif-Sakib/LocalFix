// client/src/pages/auth/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import AnimatedBackground from '../../components/AnimatedBackground';
import '../../styles/common/auth.css'; // Make sure this path is correct

const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const { login, register, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Login form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user_type, set_user_type] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Signup form states
    const [name, setName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [number, setNumber] = useState('');
    const [address, setAddress] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [signupUserType, setSignupUserType] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form validation states
    const [password_validity, setPasswordValidity] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        special_characters: false
    });
    const [same_password, setSamePassword] = useState(false);

    // Focus states
    const [focus_name, setFocusName] = useState(false);
    const [focus_password, setFocusPassword] = useState(false);
    const [focus_confirm_password, setFocusConfirmPassword] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            const userType = user?.user_type;
            switch (userType) {
                case 'admin': navigate('/admin'); break;
                case 'citizen': navigate('/citizen'); break;
                case 'worker': navigate('/worker'); break;
                default: navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const check_password = (e) => {
        const pwd = e.target.value;
        setSignupPassword(pwd);
        setPasswordValidity({
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            numbers: /\d/.test(pwd),
            special_characters: /[@$!%*?&]/.test(pwd)
        });
        setSamePassword(pwd === confirmPassword);
    };

    const check_confirm_password = (e) => {
        const confirmPwd = e.target.value;
        setConfirmPassword(confirmPwd);
        setSamePassword(signupPassword === confirmPwd);
    };

    const onLogin = async (e) => {
        e.preventDefault();
        if (!email || !password || !user_type) {
            return toast.error('Please fill in all fields');
        }
        const loadingToast = toast.loading('Logging in...');
        const result = await login({ email, password, user_type, rememberMe});
        toast.dismiss(loadingToast);
        if (result.success) {
            toast.success('Login successful!');
        } else {
            toast.error(result.message || 'Login failed');
        }
    };

    const onSignup = async (e) => {
        e.preventDefault();
        if (!name || !signupEmail || !number || !address || !signupPassword || !confirmPassword || !signupUserType) {
            return toast.error('Please fill in all fields');
        }
        if (!Object.values(password_validity).every(Boolean)) {
            return toast.error('Please ensure password meets all requirements');
        }
        if (!same_password) {
            return toast.error('Passwords do not match');
        }
        if (!/^01[0-9]{9}$/.test(number)) {
            return toast.error('Phone number must be 11 digits starting with 01');
        }
        const loadingToast = toast.loading('Creating account...');
        const result = await register({
            name, email: signupEmail, phone: number, address,
            password: signupPassword, user_type: signupUserType
        });
        toast.dismiss(loadingToast);
        if (result.success) {
            toast.success('Account created successfully!');
            setIsLoginView(true);
        } else {
            toast.error(result.message || 'Registration failed');
            if (result.errors) {
                result.errors.forEach(error => toast.error(error.msg));
            }
        }
    };

    return (
        <AnimatedBackground>
            <div 
                className={`container ${!isLoginView ? "signup-active" : ""}`}
                style={{minWidth: '60vw',marginTop:'20px'}}
            >
            {/* Signup Form Container */}
            <div className="form-box register">
                <form onSubmit={onSignup}>
                    <h1>Create Account</h1>
                    <div className="form-group">
                        <div className="input-box">
                            <input type="text" placeholder="Full Name" value={name} onFocus={() => setFocusName(true)} onBlur={() => setFocusName(false)} onChange={(e) => e.target.value.length <= 50 && setName(e.target.value)} required />
                            <i className="bx bx-user" />
                        </div>
                        <div className={`validation-box ${focus_name ? 'show' : 'hide'}`}>
                            <p>{name.length <= 50 ? 50 - name.length : 0}/50 characters left</p>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-box">
                            <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                            <i className="bx bx-envelope" />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-box">
                            <input type="text" placeholder="Phone Number (01XXXXXXXXX)" value={number} onChange={(e) => { const value = e.target.value.replace(/\D/g, ''); if (value.length <= 11) { setNumber(value); } }} required />
                            <i className="bx bx-phone" />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-box">
                            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                            <i className="bx bx-map" />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-box">
                            <input type={showSignupPassword ? "text" : "password"} placeholder="Password" value={signupPassword} onChange={check_password} onFocus={() => setFocusPassword(true)} onBlur={() => setFocusPassword(false)} required />
                            <i className={`bx ${showSignupPassword ? 'bx-show' : 'bx-hide'}`} onClick={() => setShowSignupPassword(!showSignupPassword)} style={{ cursor: 'pointer' }} />
                        </div>
                        <div className={`validation-box ${focus_password ? 'visible' : 'hidden'}`}>
                            <p>{password_validity.length ? "✅" : "❌"} At least 8 characters</p>
                            <p>{password_validity.uppercase ? "✅" : "❌"} At least 1 uppercase letter</p>
                            <p>{password_validity.lowercase ? "✅" : "❌"} At least 1 lowercase letter</p>
                            <p>{password_validity.numbers ? "✅" : "❌"} At least 1 number</p>
                            <p>{password_validity.special_characters ? "✅" : "❌"} At least 1 special character (@$!%*?&)</p>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-box">
                            <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={check_confirm_password} onFocus={() => setFocusConfirmPassword(true)} onBlur={() => setFocusConfirmPassword(false)} required />
                            <i className={`bx ${showConfirmPassword ? 'bx-show' : 'bx-hide'}`} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }} />
                        </div>
                        <div className={`validation-box ${focus_confirm_password ? 'visible' : 'hidden'}`}>
                            <p>{same_password ? "✅" : "❌"} Passwords match</p>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="dropdown">
                            <select name="user" value={signupUserType} onChange={(e) => setSignupUserType(e.target.value)} required>
                                <option value="" disabled>Select User Type</option>
                                <option value="citizen">Citizen</option>
                                <option value="worker">Worker</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="button">Sign Up</button>
                    <p className="mobile-toggle">
                        Already have an account? <span onClick={() => setIsLoginView(true)}>Login</span>
                    </p>
                </form>
            </div>

            {/* Login Form Container */}
            <div className="form-box login">
                <form onSubmit={onLogin}>
                    <h1>Welcome Back</h1>
                    <div className="form-group">
                        <div className="input-box">
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <i className="bx bx-envelope" />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-box">
                            <input type={showLoginPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <i className={`bx ${showLoginPassword ? 'bx-show' : 'bx-hide'}`} onClick={() => setShowLoginPassword(!showLoginPassword)} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                    <div className="form-group">
                         <div className="dropdown">
                            <select name="user" value={user_type} onChange={(e) => set_user_type(e.target.value)} required>
                                <option value="" disabled>Select User Type</option>
                                <option value="citizen">Citizen</option>
                                <option value="worker">Worker</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="remember-forgot">
                        <label className="remember-me">
                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                            Remember Me
                        </label>
                        <Link to="/forgot_password" className="forgot-link">Forgot Password?</Link>
                    </div>
                    <button type="submit" className="button">Login</button>
                    <p className="mobile-toggle">
                        Don't have an account? <span onClick={() => setIsLoginView(false)}>Sign Up</span>
                    </p>
                </form>
            </div>

            {/* Sliding Toggle Overlay */}
            <div className="toggle-container">
                <div className="toggle-overlay">
                    <div className="toggle-panel toggle-left">
                        <h1>Login</h1>
                        <p>Already have an account? Login to access your dashboard.</p>
                        <button className="toggle-button" onClick={() => setIsLoginView(true)}>Login</button>
                    </div>
                    <div className="toggle-panel toggle-right">
                        <h1>Sign Up</h1>
                        <p>Don't have an account? Register to join our community.</p>
                        <button className="toggle-button" onClick={() => setIsLoginView(false)}>Sign Up</button>
                    </div>
                </div>
            </div>
            </div>
        </AnimatedBackground>
    );
};

export default AuthPage;