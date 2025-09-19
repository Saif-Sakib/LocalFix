import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../../components/AnimatedBackground';
import '../../styles/citizen/mypost.css';

function MyPost() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Mock data for demonstration
    useEffect(() => {
        // Simulate API fetch with mock data
        setTimeout(() => {
            const mockPosts = [
                {
                    id: 1,
                    title: "My First Post",
                    content: "This is the content of my first post in the community!",
                    imageUrl: "https://via.placeholder.com/300",
                    createdAt: "2025-09-15T10:30:00"
                },
                {
                    id: 2,
                    title: "Problems in my Area",
                    content: "I've noticed several issues in our neighborhood that need attention.",
                    imageUrl: "https://via.placeholder.com/300",
                    createdAt: "2025-09-17T14:45:00"
                },
                {
                    id: 3,
                    title: "Community Event Idea",
                    content: "I'm thinking of organizing a community cleanup event. Anyone interested?",
                    imageUrl: null,
                    createdAt: "2025-09-18T09:15:00"
                }
            ];
            
            setPosts(mockPosts);
            setLoading(false);
        }, 1000);
    }, []);

    // Function to format dates nicely
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle post deletion (just for UI demonstration)
    const handleDeletePost = (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            setPosts(posts.filter(post => post.id !== postId));
        }
    };

    return (
        <AnimatedBackground>
            <div className="my-posts-wrapper">
                <h1>My Community Posts</h1>
                
                <div className="action-bar">
                    <button 
                        className="new-post-button"
                        onClick={() => navigate('/citizen?tab=post-issue')}
                    >
                        Create New Post
                    </button>
                </div>
                
                {loading ? (
                    <div className="loading-indicator">Loading your posts...</div>
                ) : posts.length === 0 ? (
                    <div className="no-posts-message">
                        <p>You haven't created any posts yet.</p>
                        <button 
                            className="create-first-post-button"
                            onClick={() => navigate('/citizen?tab=post-issue')}
                        >
                            Create Your First Post
                        </button>
                    </div>
                ) : (
                    <div className="posts-container">
                        {posts.map(post => (
                            <div key={post.id} className="post-card">
                                <div className="post-header">
                                    <h3 className="post-title">{post.title}</h3>
                                    <span className="post-date">{formatDate(post.createdAt)}</span>
                                </div>
                                
                                {post.imageUrl && (
                                    <div className="post-image">
                                        <img src={post.imageUrl} alt={post.title} />
                                    </div>
                                )}
                                
                                <div className="post-content">
                                    <p>{post.content}</p>
                                </div>
                                
                                <div className="post-actions">
                                    <button className="action-button view-button">
                                        View Details
                                    </button>
                                    <button className="action-button edit-button">
                                        Edit Post
                                    </button>
                                    <button 
                                        className="action-button delete-button"
                                        onClick={() => handleDeletePost(post.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AnimatedBackground>
    );
}

export default MyPost;