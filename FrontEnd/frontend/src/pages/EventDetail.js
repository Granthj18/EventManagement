import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./EventDetails.css"

function EventDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        const data = await res.json();
        const selectedEvent = data.find((e) => e.id === parseInt(id));
        setEvent(selectedEvent);
      } catch (err) {
        console.error("Failed to fetch event:", err);
      }
    };
    fetchEvent();
  }, [id]);

  if (!event) return <div style={{ padding: "20px" }}>Loading event...</div>;

  return (
    <div>
      <Header />
      <div className="event-container">
        <h2>{event.title}</h2>
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            style={{ width: "100%", marginBottom: "20px" }}
          />
        )}
        {event.date && <p><strong>Date:</strong> {event.date}</p>}
        {event.price && <p><strong>Price:</strong> ${event.price}</p>}
        {event.description && <p><strong>Description:</strong> {event.description}</p>}
        
        <p>
          <strong>People Enrolled:</strong> {event.attendees || 0} / {event.max_registrations || 0}
        </p>
        
        <button
          style={{ marginTop: "20px" }}
          onClick={() => navigate(`/register/${event.id}`)}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default EventDetail;
