// User Roles
export const USER_ROLES = {
    CITIZEN: 'citizen',
    WORKER: 'worker',
    ADMIN: 'admin'
};

// Job Status
export const JOB_STATUS = {
    OPEN: 'open',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CLOSED: 'closed'
};

// Application Status
export const APPLICATION_STATUS = {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
};

// Issue Categories
export const ISSUE_CATEGORIES = {
    ROAD: 'Road & Infrastructure',
    ELECTRICITY: 'Electricity & Street Lights',
    WATER: 'Water & Sanitation',
    WASTE: 'Waste Management',
    SAFETY: 'Public Safety',
    OTHER: 'Others'
};

export const API_BASE_URL = 'http://localhost:5000/api';
