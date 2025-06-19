import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./ListUsers.css";
// Importer FontAwesome pour les icônes
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import config from '../../../config';

const ListUsers = ({ allUsers, setUsersChange }) => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);  
  const [editUser, setEditUser] = useState({
    user_id: "",
    user_name: "",
    user_email: "",
    user_password: "",
    confirm_password: "",
    role: ""  });

  // Function to delete a user
  async function deleteUser(id) {
    try {
      const response = await fetch(`${config.API_URL}/dashboard/users/${id}`, {
        method: "DELETE",
        headers: { token: localStorage.token }
      });
      console.log("Deleting user with ID:", id);

      if (response.ok) {
        // Update local state after successful deletion
        const updatedUsers = users.filter(user => user.user_id !== id);
        setUsers(updatedUsers);

        // Optionally, notify parent component of user change
        if (setUsersChange) {
          setUsersChange(updatedUsers);
        }

        toast.success("User deleted successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to delete user");
    }
  }

  useEffect(() => {
    // Update users state when allUsers prop changes
    if (allUsers) {
      // Filter out users with 'admin' role
      const filteredUsers = allUsers.filter(user => user.role !== 'admin');
      setUsers(filteredUsers);    }
  }, [allUsers]);  // Function to open edit modal
  const openEditModal = (user) => {
    setPasswordsMatch(true); // Réinitialiser l'état de correspondance des mots de passe
    setEditUser({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_password: "",
      confirm_password: "",
      role: user.role
    });
    setShowModal(true);
  };
  // Function to handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = {
      ...editUser,
      [name]: value
    };
    
    setEditUser(updatedUser);
    
    // Vérifier si les mots de passe correspondent
    if (name === 'user_password' || name === 'confirm_password') {
      if (updatedUser.user_password || updatedUser.confirm_password) {
        setPasswordsMatch(updatedUser.user_password === updatedUser.confirm_password);
      } else {
        setPasswordsMatch(true); // Les deux champs sont vides
      }
    }
  };  // Function to update user
  const updateUser = async (e) => {
    e.preventDefault();
    try {
      // Vérifier que les mots de passe correspondent
      if (editUser.user_password && editUser.user_password !== editUser.confirm_password) {
        toast.error("Passwords do not match");
        setPasswordsMatch(false);
        return;
      }
      
      const body = { ...editUser };
      
      // Only include password if it was entered
      if (!body.user_password) {
        delete body.user_password;
      }
        // Supprimer le champ confirm_password avant d'envoyer au serveur
      delete body.confirm_password;
      
      const response = await fetch(`${config.API_URL}/dashboard/users/${editUser.user_id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          token: localStorage.token 
        },
        body: JSON.stringify(body)
      });      if (response.ok) {
        // Update user in the local state
        const updatedUsers = users.map(user => 
          user.user_id === editUser.user_id 
            ? { ...user, user_name: editUser.user_name, user_email: editUser.user_email } 
            : user
        );
        
        setUsers(updatedUsers);
        
        // Notify parent component
        if (setUsersChange) {
          setUsersChange(updatedUsers);
        }
        
        toast.success("User updated successfully");
        setShowModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="users-container">
      <h2 className="users-title">User Management</h2>
      {users && users.length > 0 ? (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id}>
                <td>{user.user_name}</td>
                <td>{user.user_email}</td>
                <td>
                  <span className={`role-badge ${
                    user.role === 'admin' ? 'role-admin' : 
                    user.role === 'manager' ? 'role-manager' : 
                    user.role === 'rh' ? 'role-rh' :                    user.role === 'employee' ? 'role-employee' : 
                    'role-default'
                  }`}>
                    {user.role || 'user'}
                  </span>
                </td>                
                <td style={{ textAlign: 'center' }}>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(user)}
                      title="Edit user"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(user.user_id)}
                      title="Delete user"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>      ) : (
        <div className="empty-list">No users found</div>
      )}

      {/* Edit User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={updateUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="user_name"
                  value={editUser.user_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="user_email"
                  value={editUser.user_email}
                  onChange={handleChange}
                  required
                />
              </div>              <div className="form-group">
                <label>Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="user_password"
                  value={editUser.user_password}
                  onChange={handleChange}
                  placeholder="New password"
                  className={editUser.user_password && !passwordsMatch ? "password-error" : ""}
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={editUser.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className={editUser.confirm_password && !passwordsMatch ? "password-error" : ""}
                />
                {editUser.user_password && editUser.confirm_password && !passwordsMatch && (
                  <div className="password-mismatch">Passwords do not match</div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>  );
};

export default ListUsers;