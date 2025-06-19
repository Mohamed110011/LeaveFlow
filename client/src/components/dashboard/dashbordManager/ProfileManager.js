import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ProfileManager.css';

const ProfileManager = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    // We keep only the fields that exist in the database
  });
  const [errors, setErrors] = useState({});

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5001/dashboard/', {
          method: 'GET',
          headers: { token: localStorage.token }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUserData(data);
        setFormData({
          user_name: data.user_name || '',
          user_email: data.user_email || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.user_name) newErrors.user_name = 'Name is required';
    if (!formData.user_email) newErrors.user_email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.user_email)) newErrors.user_email = 'Email is invalid';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const response = await fetch('http://localhost:5001/dashboard/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          token: localStorage.token 
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return <div className="profile-loading">Loading profile data...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {userData?.user_name?.charAt(0)}
            </div>
            <h2>{userData?.user_name}</h2>
            <p className="job-title">{userData?.role || 'Manager'}</p>
          </div>

          {isEditing ? (
            <div className="profile-form-container">
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="user_name">Full Name</label>
                    <input
                      type="text"
                      id="user_name"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleChange}
                      className={errors.user_name ? 'error' : ''}
                    />
                    {errors.user_name && <span className="error-message">{errors.user_name}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="user_email">Email</label>
                    <input
                      type="email"
                      id="user_email"
                      name="user_email"
                      value={formData.user_email}
                      onChange={handleChange}
                      className={errors.user_email ? 'error' : ''}
                    />
                    {errors.user_email && <span className="error-message">{errors.user_email}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      value={userData?.role || 'Manager'}
                      disabled
                      className="disabled-field"
                    />
                  </div>
                </div>
                
                <div className="form-buttons">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        user_name: userData?.user_name || '',
                        user_email: userData?.user_email || '',
                      });
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">Save Changes</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="profile-details">              <div className="detail-section">
                <h3>User Information</h3>
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{userData?.user_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{userData?.user_email}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{userData?.role || 'Manager'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;