import React from 'react';
import { FaUsers, FaHardHat, FaUserShield } from 'react-icons/fa';

const UserRoles = () => (
    <section id="roles" className="user-roles">
        <div className="section-header">
            <h2>For Everyone in the Community</h2>
        </div>
        <div className="roles-grid">
            <div className="role-card">
                <h4><FaUsers /> Citizens</h4>
                <p>Be the eyes of your community. Report issues, monitor progress, and make a real impact.</p>
            </div>
            <div className="role-card">
                <h4><FaHardHat /> Workers</h4>
                <p>Find meaningful jobs in your area. Build your reputation and get paid for your skills.</p>
            </div>
            <div className="role-card">
                <h4><FaUserShield /> Admins</h4>
                <p>Oversee the process, ensure quality, and facilitate a thriving local ecosystem.</p>
            </div>
        </div>
    </section>
);

export default UserRoles;
