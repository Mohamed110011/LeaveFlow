import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './Calendar.css';

// Liste statique des jours fériés
const joursFeries2025 = [
  {
    title: "Jour de l'an",
    start: "2025-01-01",
    end: "2025-01-01",
    description: "Nouvel an"
  },
  {
    title: "Pâques",
    start: "2025-04-20",
    end: "2025-04-20",
    description: "Dimanche de Pâques"
  },
  {
    title: "Fête du Travail",
    start: "2025-05-01",
    end: "2025-05-01",
    description: "Journée internationale du travail"
  },
  {
    title: "Victoire 1945",
    start: "2025-05-08",
    end: "2025-05-08",
    description: "Armistice de la Seconde Guerre mondiale"
  },
  {
    title: "Ascension",
    start: "2025-05-29",
    end: "2025-05-29",
    description: "Jeudi de l'Ascension"
  },
  {
    title: "Pentecôte",
    start: "2025-06-08",
    end: "2025-06-08",
    description: "Dimanche de Pentecôte"
  },
  {
    title: "Fête Nationale",
    start: "2025-07-14",
    end: "2025-07-14",
    description: "Jour de la Bastille"
  },
  {
    title: "Assomption",
    start: "2025-08-15",
    end: "2025-08-15",
    description: "Assomption de Marie"
  },
  {
    title: "Toussaint",
    start: "2025-11-01",
    end: "2025-11-01",
    description: "Fête de tous les saints"
  },
  {
    title: "Armistice 1918",
    start: "2025-11-11",
    end: "2025-11-11",
    description: "Armistice de la Première Guerre mondiale"
  },
  {
    title: "Noël",
    start: "2025-12-25",
    end: "2025-12-25",
    description: "Jour de Noël"
  }
];

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
          return isMatch;
        });

        // Créer les événements de congés
        const congesEvents = filteredDemandes.map(demande => ({
          title: userRole === 'employee' 
            ? `Congé: ${demande.type_conge || 'Type ' + demande.type_conge_id}` 
            : `${demande.user_name || 'Employé'} - Type ${demande.type_conge_id}`,
          start: new Date(demande.date_debut).toISOString().split('T')[0],
          end: new Date(demande.date_fin).toISOString().split('T')[0],
          backgroundColor: '#4CAF50',
          className: 'conge-event',
          extendedProps: {
            description: demande.raison || '',
            type: 'conge'
          }
        }));

        // Créer les événements des jours fériés
        const feriesEvents = joursFeries2025.map(ferie => ({
          ...ferie,
          className: 'ferie-event',
          backgroundColor: '#FF4444',
          extendedProps: {
            type: 'ferie',
            description: ferie.description
          }
        }));

        // Combiner tous les événements
        setEvents([...congesEvents, ...feriesEvents]);
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
        <div className="legend-item">
          <span className="color-box ferie"></span>
          <span>Jours fériés</span>
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
