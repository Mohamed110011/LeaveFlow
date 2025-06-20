import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './Calendar.css';

const Calendar = ({ userRole }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Récupérer l'utilisateur connecté
        const response = await fetch("http://localhost:5001/dashboard/", {
          method: "GET",
          headers: { token: localStorage.token }
        });
        
        if (!response.ok) throw new Error("Erreur d'authentification");
        const userData = await response.json();
        console.log('Utilisateur connecté:', userData);
        
        // Récupérer les congés
        const congeDemandes = await fetch("http://localhost:5001/dashboard/demandes-conge", {
          method: "GET",
          headers: { token: localStorage.token }
        });

        if (!congeDemandes.ok) throw new Error("Erreur de récupération des congés");
        const demandesData = await congeDemandes.json();

        // Filtrer les congés
        const filteredDemandes = demandesData.filter(demande => {
          const isMatch = userRole === 'employee' 
            ? demande.utilisateur_id === userData.user_id && demande.statut === 'Approuve'
            : demande.statut === 'Approuve';
            
          console.log('Analyse demande:', {
            demandeId: demande.id,
            utilisateurId: demande.utilisateur_id,
            userDataId: userData.user_id,
            estMatch: isMatch,
            statut: demande.statut
          });
          
          return isMatch;
        });

        console.log('Demandes filtrées:', filteredDemandes);

        // Créer les événements pour le calendrier
        const calendarEvents = filteredDemandes.map(demande => ({
          title: userRole === 'employee' 
            ? `Congé: ${demande.type_conge || 'Type ' + demande.type_conge_id}` 
            : `${demande.user_name || 'Employé'} - Type ${demande.type_conge_id}`,
          start: new Date(demande.date_debut).toISOString().split('T')[0],
          end: new Date(demande.date_fin).toISOString().split('T')[0],
          backgroundColor: '#4CAF50',
          extendedProps: {
            description: demande.raison || ''
          }
        }));

        console.log('Événements du calendrier:', calendarEvents);
        setEvents(calendarEvents);
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userRole]);

  if (loading) return <div>Chargement du calendrier...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="calendar-container">
      <div className="legend">
        <div className="legend-item">
          <span className="color-box leave"></span>
          <span>{userRole === 'employee' ? 'Mes congés approuvés' : 'Congés approuvés'}</span>
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        locale="fr"
        eventDidMount={(info) => {
          if (info.event.extendedProps.description) {
            info.el.title = info.event.extendedProps.description;
          }
        }}
      />
    </div>
  );
};

export default Calendar;
