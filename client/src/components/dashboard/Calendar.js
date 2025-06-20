import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import { publicHolidays, teamLeaves, teamStructure } from './calendarData';
import './Calendar.css';

const Calendar = ({ userRole = 'employee', userId = 'current-user', departmentId = 'dev' }) => {
  const { t, i18n } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    showHolidays: true,
    showTeamLeaves: true,
    selectedDepartment: departmentId,
    selectedUsers: []
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    start: '',
    end: '',
    type: 'vacation',
    description: ''
  });

  const [filteredEvents, setFilteredEvents] = useState([]);

  // Fonction pour filtrer les événements selon le rôle et les filtres
  const filterEvents = () => {
    let events = [...publicHolidays];
    
    if (filters.showTeamLeaves) {
      let relevantLeaves = teamLeaves;

      if (userRole === 'employee') {
        // Les employés ne voient que leurs congés et les congés approuvés de leur équipe
        relevantLeaves = teamLeaves.filter(leave => 
          leave.userId === userId || 
          (leave.status === 'approved' && 
           teamStructure.departments.find(d => d.id === departmentId)?.members.includes(leave.userId))
        );
      } else if (userRole === 'manager') {
        // Les managers voient les congés de leur département
        const departmentMembers = teamStructure.departments.find(d => d.id === departmentId)?.members || [];
        relevantLeaves = teamLeaves.filter(leave => departmentMembers.includes(leave.userId));
      }
      // RH voit tous les congés par défaut

      events = [...events, ...relevantLeaves];
    }

    if (filters.selectedUsers.length > 0) {
      events = events.filter(event => 
        event.type === 'holiday' || 
        filters.selectedUsers.includes(event.userId)
      );
    }

    return events;
  };

  useEffect(() => {
    setFilteredEvents(filterEvents());
  }, [filters, userRole, departmentId]);

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const renderFilters = () => (
    <div className="calendar-filters">
      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={filters.showHolidays}
            onChange={(e) => handleFilterChange('showHolidays', e.target.checked)}
          />
          {t('calendar.filters.showHolidays')}
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.showTeamLeaves}
            onChange={(e) => handleFilterChange('showTeamLeaves', e.target.checked)}
          />
          {t('calendar.filters.showTeamLeaves')}
        </label>
      </div>

      {(userRole === 'manager' || userRole === 'hr') && (
        <div className="filter-group">
          <select
            value={filters.selectedDepartment}
            onChange={(e) => handleFilterChange('selectedDepartment', e.target.value)}
          >
            <option value="">{t('calendar.filters.allDepartments')}</option>
            {teamStructure.departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  const canEditEvent = (event) => {
    if (!event) return false;
    if (event.type === 'holiday') return userRole === 'hr';
    if (userRole === 'hr') return true;
    if (userRole === 'manager') {
      const departmentMembers = teamStructure.departments.find(d => d.id === departmentId)?.members || [];
      return departmentMembers.includes(event.userId);
    }
    return event.userId === userId && event.status !== 'approved';
  };

  const handleDateClick = (arg) => {
    setEventForm({
      ...eventForm,
      start: arg.dateStr,
      end: arg.dateStr
    });
    setShowModal(true);
  };

  const handleEventClick = (arg) => {
    setSelectedEvent(arg.event);
    setEventForm({
      title: arg.event.title,
      start: arg.event.startStr,
      end: arg.event.endStr || arg.event.startStr,
      type: arg.event.classNames[0] || 'vacation',
      description: arg.event.extendedProps.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, vous ajouteriez la logique pour sauvegarder l'événement
    // Dans une application réelle, cela impliquerait un appel API
    console.log('Saving event:', eventForm);
    setShowModal(false);
    setEventForm({
      title: '',
      start: '',
      end: '',
      type: 'vacation',
      description: ''
    });
  };

  const handleDelete = () => {
    if (selectedEvent) {
      selectedEvent.remove();
    }
    setShowModal(false);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2 className="calendar-title">{t('calendar.title')}</h2>
        {renderFilters()}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        }}
        locale={i18n.language === 'fr' ? frLocale : 'en'}
        events={filteredEvents}
        editable={userRole !== 'employee'}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventClassNames="calendar-event"
        eventContent={(arg) => {
          return (
            <div className={`event-content ${arg.event.className}`}>
              <div className="event-title">
                {arg.event.title}
              </div>
              {arg.event.extendedProps.type !== 'holiday' && (
                <div className="event-user">
                  {arg.event.extendedProps.userName}
                </div>
              )}
            </div>
          );
        }}
      />

      {showModal && (
        <>
          <div className="event-modal-overlay" onClick={() => setShowModal(false)} />
          <div className="event-modal">
            <h3>{selectedEvent ? t('calendar.modal.editTitle') : t('calendar.modal.addTitle')}</h3>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label>{t('calendar.modal.type')}</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                >
                  <option value="vacation">{t('calendar.events.vacation')}</option>
                  <option value="sick-leave">{t('calendar.events.sickLeave')}</option>
                  <option value="work-from-home">{t('calendar.events.workFromHome')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('calendar.modal.startDate')}</label>
                <input
                  type="date"
                  value={eventForm.start}
                  onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('calendar.modal.endDate')}</label>
                <input
                  type="date"
                  value={eventForm.end}
                  onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
                  min={eventForm.start}
                />
              </div>
              <div className="form-group">
                <label>{t('calendar.modal.description')}</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                {selectedEvent && (
                  <button
                    type="button"
                    className="btn-modal danger"
                    onClick={handleDelete}
                  >
                    {t('calendar.modal.delete')}
                  </button>
                )}
                <button
                  type="button"
                  className="btn-modal secondary"
                  onClick={() => setShowModal(false)}
                >
                  {t('calendar.modal.cancel')}
                </button>
                <button type="submit" className="btn-modal primary">
                  {t('calendar.modal.save')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
