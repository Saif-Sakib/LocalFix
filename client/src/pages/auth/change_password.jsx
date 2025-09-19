import React, { useState } from 'react';
import axios from 'axios';
import Set_new_password from "./set_new_password";
import '../../styles/common/change_password.css';

function Change_password({email , set_pop_up}) {

    const [password, set_password] = useState("");
    const [verified,set_verified] = useState(false);
    const [show_password, set_show_new_password] = useState(false);

    const check_password = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/verify-password', { password }, { withCredentials: true });
            if (res.data?.success) {
                set_verified(true);
            } else {
                alert(res.data?.message || 'Password verification failed');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Password verification failed';
            alert(msg);
        }
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
                            email={null}
                            onComplete={() => set_pop_up(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Change_password;