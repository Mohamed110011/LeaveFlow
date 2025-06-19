import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './GererConges.css';

const GererConges = () => {
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [typeConges, setTypeConges] = useState([]);
  const [users, setUsers] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, leaveRequests]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch all leave requests
      console.log("Fetching leave requests...");

      const requestsResponse = await fetch("http://localhost:5001/dashboard/demandes-conge", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!requestsResponse.ok) {
        const errorText = await requestsResponse.text();
        console.error("Request failed with status:", requestsResponse.status, errorText);
        throw new Error(`Failed to fetch leave requests: ${requestsResponse.status}`);
      }

      const requestsData = await requestsResponse.json();
      console.log("Leave requests data:", requestsData);
      setLeaveRequests(requestsData);

      // Fetch leave types
      console.log("Fetching leave types...");
      const typesResponse = await fetch("http://localhost:5001/dashboard/type-conges", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        console.log("Leave types data:", typesData);
        setTypeConges(typesData);
      } else {
        console.error("Failed to fetch leave types:", typesResponse.status);
      }

      // Fetch users
      console.log("Fetching users...");
      const usersResponse = await fetch("http://localhost:5001/dashboard/users", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log("Users data:", usersData);
        setUsers(usersData);
      } else {
        console.error("Failed to fetch users:", usersResponse.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load leave requests: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaveRequests];

    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter(request => request.statut === STATUS.PENDING);
    } else if (filter === 'approved') {
      filtered = filtered.filter(request => request.statut === STATUS.APPROVED);
    } else if (filter === 'rejected') {
      filtered = filtered.filter(request => request.statut === STATUS.REJECTED);
    }

    // Apply search filter (on user name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request => {
        const user = users.find(u => u.user_id === request.utilisateur_id);
        return user && user.user_name.toLowerCase().includes(searchLower);
      });
    }

    setFilteredRequests(filtered);
  };

  // Define statuses without accents
  const STATUS = {
    PENDING: 'En attente',
    APPROVED: 'Approuve', // Without accent
    REJECTED: 'Refuse'    // Without accent
  };

  // Display status with accents for frontend
  const afficherStatut = (statut) => {
    switch (statut) {
      case 'Approuve':
        return 'Approuvé'; // With accent for frontend display
      case 'Refuse':
        return 'Refusé';   // With accent for frontend display
      default:
        return statut;
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setError(null);
      setProcessingRequestId(requestId);

      console.log('Sending approval request for ID:', requestId);

      const response = await fetch(
        `http://localhost:5001/dashboard/demandes-conge/${requestId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.token
          },
          body: JSON.stringify({
            statut: STATUS.APPROVED,
            commentaire: "Request approved by manager"
          })
        }
      );

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        // Refresh data with await to ensure completion
        await fetchData();
        toast.success('Demande approuvée avec succès');
      } else {
        setError(data.message || 'Erreur lors de l\'approbation');
        toast.error(data.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'approbation');
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const openRejectModal = (requestId) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
    setRejectReason(''); // Reset reason when opening modal
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setError(null);
      setProcessingRequestId(selectedRequestId);

      console.log('Sending rejection request for ID:', selectedRequestId);

      const response = await fetch(
        `http://localhost:5001/dashboard/demandes-conge/${selectedRequestId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.token
          },
          body: JSON.stringify({
            statut: STATUS.REJECTED,
            commentaire: rejectReason
          })
        }
      );

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        // Refresh data with await to ensure completion
        await fetchData();
        toast.success('Demande rejetée avec succès');
        setShowRejectModal(false); // Close the modal after successful rejection
      } else {
        setError(data.message || 'Erreur lors du rejet');
        toast.error(data.message || 'Erreur lors du rejet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du rejet');
      toast.error('Erreur lors du rejet');
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate duration of leave in days
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Get user name from user ID
  const getUserName = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.user_name : 'Unknown User';
  };

  // Get leave type name from type ID
  const getLeaveTypeName = (typeId) => {
    const type = typeConges.find(t => t.id === typeId);
    return type ? type.nom : 'Unknown Type';
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case STATUS.APPROVED:
        return 'badge-success';
      case STATUS.REJECTED:
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="gerer-conges-container">
      <h1>Leave Requests Management</h1>

      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Requests
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading leave requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="no-data">No leave requests found matching your criteria</div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.id} className={request.statut === STATUS.PENDING ? 'pending-row' : ''}>
                  <td>{getUserName(request.utilisateur_id)}</td>
                  <td>{getLeaveTypeName(request.type_conge_id)}</td>
                  <td>{formatDate(request.date_debut)}</td>
                  <td>{formatDate(request.date_fin)}</td>
                  <td>{calculateDuration(request.date_debut, request.date_fin)} days</td>
                  <td className="reason-cell">
                    <div className="truncated-text">{request.raison}</div>
                    <div className="tooltip">{request.raison}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(request.statut)}`}>
                      {afficherStatut(request.statut)} {/* Display with accent */}
                    </span>
                  </td>
                  <td>{formatDate(request.date_creation)}</td>
                  <td>
                    {request.statut === STATUS.PENDING && (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processingRequestId === request.id}
                          className={`btn btn-success btn-sm ${processingRequestId === request.id ? 'disabled' : ''}`}
                        >
                          {processingRequestId === request.id ? 'En cours...' : 'Approuver'}
                        </button>
                        <button
                          onClick={() => openRejectModal(request.id)}
                          disabled={processingRequestId === request.id}
                          className={`btn btn-danger btn-sm ${processingRequestId === request.id ? 'disabled' : ''}`}
                        >
                          {processingRequestId === request.id ? 'En cours...' : 'Rejeter'}
                        </button>
                      </div>
                    )}
                    {request.statut !== STATUS.PENDING && (
                      <span className="processed-by">
                        {request.commentaire && (
                          <div className="comment-tooltip">
                            <span className="info-icon">ℹ</span>
                            <div className="tooltip-text">{request.commentaire}</div>
                          </div>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="reject-modal">
            <h2>Reject Leave Request</h2>
            <p>Please provide a reason for rejecting this request:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows="4"
            ></textarea>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleReject}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GererConges;
