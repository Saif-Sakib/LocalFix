import React, { useState } from 'react';
import '../../styles/common/change_password.css';

function Set_new_password({ email, onComplete }) {

    const [new_password, set_new_password] = useState("");
    const [confirm_password, set_confirm_password] = useState("");    
    const [show_new_password, set_show_new_password] = useState(false);
    const [show_confirm_password, set_show_confirm_password] = useState(false);
    const [focus_password, setFocusPassword] = useState(false);
    const [focus_confirm_password, setFocusConfirmPassword] = useState(false);

    const [password_validity, setPasswordValidity] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        special_characters: false
    });
    const [same_password, setSamePassword] = useState(false);
    
    const check_password = (e) => {
        const pwd = e.target.value;
        set_new_password(pwd);
        setPasswordValidity({
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            numbers: /\d/.test(pwd),
            special_characters: /[@$!%*?&]/.test(pwd)
        });
        setSamePassword(pwd === confirm_password);
    };

    const check_confirm_password = (e) => {
        const confirmPwd = e.target.value;
        set_confirm_password(confirmPwd);
        setSamePassword(new_password === confirmPwd);
    };

    const reset_password = (e) => {
        e.preventDefault();
        console.log(email+" "+new_password);
        // Add your password reset logic here
        // Once successful, call onComplete if provided
        if (onComplete) {
            onComplete();
        }
    }

    return(
        <form onSubmit={reset_password}>
            <h1>Change Your Password</h1>
            <div className="form-group">
                <div className="input-box">
                    <input type={show_new_password ? "text" : "password"} placeholder="New Password" value={new_password} onChange={check_password} onFocus={() => setFocusPassword(true)} onBlur={() => setFocusPassword(false)} required />
                    <i className={`bx ${show_new_password ? 'bx-show' : 'bx-hide'}`} onClick={() => set_show_new_password(!show_new_password)} style={{ cursor: 'pointer' }} />
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
                    <input type={show_confirm_password ? "text" : "password"} placeholder="Confirm Password" value={confirm_password} onChange={check_confirm_password} onFocus={() => setFocusConfirmPassword(true)} onBlur={() => setFocusConfirmPassword(false)} required />
                    <i className={`bx ${show_confirm_password ? 'bx-show' : 'bx-hide'}`} onClick={() => set_show_confirm_password(!show_confirm_password)} style={{ cursor: 'pointer' }} />
                </div>
                <div className={`validation-box ${focus_confirm_password ? 'visible' : 'hidden'}`}>
                    <p>{same_password ? "✅" : "❌"} Passwords match</p>
                </div>
            </div>
            <button type="submit" className="button">Reset Password</button>
        </form>
    );
}

export default Set_new_password;