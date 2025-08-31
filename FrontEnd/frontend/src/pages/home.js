import Header from '../Header/Header';
import './Home.css';
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

function EventCard({ event }) {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.stopPropagation(); // prevent card click
    navigate(`/register/${event.id}`);
  };

  const handleCardClick = () => {
    navigate(`/event/${event.id}`);
  };

  return (
    <div className="event-card" onClick={handleCardClick}>
      {event.image && (
        <img src={event.image} alt={event.title} className="event-image" />
      )}
      <h3>{event.title}</h3>
      {event.date && <p>Date: {event.date}</p>}
      {event.rating && <p>Rating: {event.rating}</p>}
      {event.attendees && <p>Attendees: {event.attendees}</p>}
      <p>Price: ${event.price}</p>
      <button className="register-button" onClick={handleRegister}>
        Register
      </button>
    </div>
  );
}



function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <Header />

      <div className="home-section">
        <h2>Upcoming Events</h2>
        <div className="events-row">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      <div className="home-section">
        <h2>Top Rated Events</h2>
        <div className="events-row">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      <div className="home-section">
        <h2>Recently Done Events</h2>
        <div className="events-row">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
