import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import config from '../../../config';
import './SoldeConges.css';

const SoldeConges = () => {
  const [soldes, setSoldes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSoldes();
  }, [currentYear]);

  const fetchSoldes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${config.API_URL}/dashboard/soldes?annee=${currentYear}`, {
        method: 'GET',
        headers: { token: localStorage.token }
      });

      if (!response.ok) {
        throw new Error(`Error fetching leave balances: ${response.status}`);
      }

      const data = await response.json();
      console.log('Leave balances data:', data);
      setSoldes(data);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      setError(error.message || 'Failed to fetch leave balances');
      toast.error(error.message || 'Failed to fetch leave balances');
    } finally {
      setIsLoading(false);
    }
  };

  // Change year handler
  const handleYearChange = (event) => {
    setCurrentYear(parseInt(event.target.value));
  };

  // Generate year options (current year and previous 5 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  return (
    <div className="solde-conges-container">
      <div className="solde-header">
        <h2>Leave Balances</h2>
        <div className="year-selector">
          <label htmlFor="year-select">Year: </label>
          <select 
            id="year-select" 
            value={currentYear} 
            onChange={handleYearChange}
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading leave balances...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : soldes.length === 0 ? (
        <div className="no-data">No leave balance records found for {currentYear}</div>
      ) : (
        <div className="soldes-table-container">
          <table className="soldes-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Initial Balance</th>
                <th>Used</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {soldes.map((solde) => (
                <tr key={solde.id}>
                  <td>{solde.type_nom}</td>
                  <td>{solde.solde_initial} days</td>
                  <td>{solde.solde_initial - solde.solde_restant} days</td>
                  <td className={solde.solde_restant < 5 ? 'low-balance' : ''}>
                    {solde.solde_restant} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SoldeConges;