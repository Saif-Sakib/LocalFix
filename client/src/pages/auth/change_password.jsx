import React, { useState } from 'react';
import Set_new_password from "./set_new_password";
import '../../styles/common/change_password.css';

function Change_password({email , set_pop_up}) {

    const [password, set_password] = useState("");
    const [verified,set_verified] = useState(false);
    const [show_password, set_show_new_password] = useState(false);

    const check_password = (e) => {
        e.preventDefault();
        // Add your password verification logic here
        // For now, we'll assume it's verified
        set_verified(true);
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            set_pop_up(false);
        }
    }

    return(
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <button className="modal-close" onClick={() => set_pop_up(false)}>×</button>
                </div>
                <div className="modal-body">
                    {!verified && (
                        <form onSubmit={check_password}>
                            <h1>Change Your Password</h1>
                            <div className="form-group">
                                <div className="input-box">
                                    <input type={show_password ? "text" : "password"} placeholder="Current Password" value={password} onChange={(e) => set_password(e.target.value)}required />
                                    <i className={`bx ${show_password ? 'bx-show' : 'bx-hide'}`} onClick={() => set_show_new_password(!show_password)} style={{ cursor: 'pointer' }} />
                                </div>
                            </div>
                            <button type="submit" className="button">Verify Password</button>
                        </form>
                    )}

                    {verified && (
                        <Set_new_password
                            email={email} 
                            onComplete={() => set_pop_up(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Change_password;