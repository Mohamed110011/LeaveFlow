import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './DemandeConge.css';

// Configuration des toasts
const toastConfig = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const showDateError = () => {
  toast.error(
    <div className="date-error-popup">
      <h4>⚠️ Date Invalide!</h4>
      <p>La date de début ne peut pas être dans le passé.</p>
      <small>Veuillez choisir une date à partir d'aujourd'hui.</small>
    </div>,
    {
      ...toastConfig,
      className: 'date-error-toast',
      style: {
        background: '#FFE4E4',
        color: '#D70000',
        borderLeft: '4px solid #D70000',
        padding: '16px',
        fontSize: '1.1em'
      }
    }
  );
};

const showError = (message) => {
  toast.error(message, {
    ...toastConfig,
    icon: '❌',
    style: { backgroundColor: '#FDE7E9', color: '#BE123C' }
  });
};

const showSuccess = (message) => {
  toast.success(message, {
    ...toastConfig,
    icon: '✅',
    style: { backgroundColor: '#DCFCE7', color: '#166534' }
  });
};

const validateStartDate = (startDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  
  if (startDate < today) {
    showDateError();
    return false;
  }
  return true;
};

const DemandeConge = ({ refreshData }) => {
  const [formData, setFormData] = useState({
    date_debut: '',
    date_fin: '',
    raison: '',
    type_conge_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeConges, setTypeConges] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [showForm, setShowForm] = useState(false); // Nouvel état pour contrôler l'affichage du formulaire

  // Fetch leave types on component mount
  useEffect(() => {
    fetchTypeConges();
    fetchDemandesConge();
  }, []);

  const fetchTypeConges = async () => {
    try {
      const response = await fetch("http://localhost:5001/dashboard/type-conges", {
        method: "GET",
        headers: { token: localStorage.token }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch leave types");
      }
      
      const data = await response.json();
      setTypeConges(data);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      showError("Could not load leave types");
    }
  };

  const fetchDemandesConge = async () => {
    try {
      const response = await fetch("http://localhost:5001/dashboard/demandes-conge", {
        method: "GET",
        headers: { token: localStorage.token }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }
      
      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      showError("Could not load your leave requests");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation immédiate de la date de début
    if (name === 'date_debut' && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        showDateError();
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const { date_debut, date_fin, raison, type_conge_id } = formData;
    
    if (!date_debut || !date_fin || !raison || !type_conge_id) {
      showError("Veuillez remplir tous les champs requis");
      return;
    }
    
    // Validate dates
    const startDate = new Date(date_debut);
    const endDate = new Date(date_fin);
    
    // Set hours to 0 for accurate date comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (startDate > endDate) {
      showError("La date de fin doit être postérieure à la date de début");
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      showDateError();
      return;
    }

    // Validate minimum notice period (3 days)
    const minNoticeDate = new Date();
    minNoticeDate.setDate(minNoticeDate.getDate() + 3);
    minNoticeDate.setHours(0, 0, 0, 0);
    if (startDate < minNoticeDate) {
      showError("La demande doit être faite au moins 3 jours à l'avance");
      return;
    }

    // Validate maximum duration (30 days)
    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (durationInDays > 30) {
      showError("La durée maximale d'un congé est de 30 jours");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch("http://localhost:5001/dashboard/demandes-conge", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          token: localStorage.token
        },
        body: JSON.stringify({
          date_debut,
          date_fin,
          raison,
          type_conge_id,
          statut: "En attente"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la soumission de la demande");
      }
      
      // Reset form
      setFormData({
        date_debut: '',
        date_fin: '',
        raison: '',
        type_conge_id: '',
      });
      
      showSuccess("Votre demande de congé a été soumise avec succès");
      
      // Fermer le formulaire après soumission
      setShowForm(false);
      
      // Refresh leave requests
      fetchDemandesConge();
      
      // Refresh parent component data if callback exists
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      showError(error.message || "Échec de la soumission de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approuvé':
        return 'badge-success';
      case 'Refusé':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/dashboard/demandes-conge/${id}`, {
        method: "DELETE",
        headers: { token: localStorage.token }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete leave request");
      }
      
      // Update local state to remove the deleted request
      setDemandes(demandes.filter(demande => demande.id !== id));
      showSuccess("Leave request deleted successfully");
      
      // Refresh parent component data if callback exists
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error("Error deleting leave request:", error);
      showError(error.message || "Failed to delete leave request");
    }
  };

  return (
    <div className="demande-conge-container">
      {/* Bouton pour afficher/cacher le formulaire */}
      <div className="form-toggle-container">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="toggle-form-button"
        >
          {showForm ? 'Hide Leave Request Form' : 'New Leave Request'}
        </button>
      </div>

      {/* Formulaire conditionnellement rendu */}
      {showForm && (
        <div className="form-container">
          <h2>Submit Leave Request</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="type_conge_id">Leave Type</label>
              <select 
                id="type_conge_id"
                name="type_conge_id"
                value={formData.type_conge_id}
                onChange={handleChange}
                required
              >
                <option value="">Select leave type</option>
                {typeConges.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date_debut">Start Date</label>
                <input
                  type="date"
                  id="date_debut"
                  name="date_debut"
                  value={formData.date_debut}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date_fin">End Date</label>
                <input
                  type="date"
                  id="date_fin"
                  name="date_fin"
                  value={formData.date_fin}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="raison">Reason</label>
              <textarea
                id="raison"
                name="raison"
                value={formData.raison}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Please provide a reason for your leave request"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="history-container">
        <h2>Leave Request History</h2>
        {demandes.length === 0 ? (
          <p className="no-requests">You have no leave requests yet</p>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map(demande => (
                  <tr key={demande.id}>
                    <td>{typeConges.find(t => t.id === demande.type_conge_id)?.nom || 'Unknown'}</td>
                    <td>{formatDate(demande.date_debut)}</td>
                    <td>{formatDate(demande.date_fin)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(demande.statut)}`}>
                        {demande.statut}
                      </span>
                    </td>
                    <td>{formatDate(demande.date_creation)}</td>
                    <td>
                      {demande.statut === 'En attente' && (
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(demande.id)}
                          title="Delete request"
                        >
                          ×
                        </button>
                      )}
                      {demande.commentaire && demande.statut !== 'En attente' && (
                        <div className="comment-tooltip">
                          <span className="info-icon">ℹ</span>
                          <div className="tooltip-text">{demande.commentaire}</div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandeConge;