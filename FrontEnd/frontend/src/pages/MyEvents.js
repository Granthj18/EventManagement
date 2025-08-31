import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import Header from "../Header/Header";

function MyEvents() {
  const { user } = useContext(UserContext);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:5000/api/registrations/mine", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRegisteredEvents(data))
      .catch((err) => console.error("Error fetching registered events:", err));

    fetch("http://localhost:5000/api/events/mine", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMyCreatedEvents(data))
      .catch((err) => console.error("Error fetching created events:", err));
  }, [user]);

  const handleCancelRegistration = async (eventId) => {
    try {
      const res = await fetch("http://localhost:5000/api/registrations/cancel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId }),
      });

      if (res.ok) {
        alert("Registration cancelled!");
        setRegisteredEvents(registeredEvents.filter((e) => e.event_id !== eventId));
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        alert("Event deleted successfully");
        setMyCreatedEvents(myCreatedEvents.filter((e) => e.id !== eventId));
      }
    } catch (err) {
      console.error("Delete event error:", err);
    }
  };

  if (!user) {
    return (
      <div>
        <Header />
        <div style={{ padding: "20px" }}>
          <h2>Please login to view your events</h2>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ padding: "20px" }}>
        <h2>My Events</h2>

        
        <h3>Events I Registered For</h3>
        {registeredEvents.length === 0 ? (
          <p>No registrations yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {registeredEvents.map((event) => (
              <li key={event.id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px" }}>
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p>Price: {event.price}</p>
                <button onClick={() => handleCancelRegistration(event.event_id)}>Cancel Registration</button>
              </li>
            ))}
          </ul>
        )}

        
        <h3>Events I Created</h3>
        {myCreatedEvents.length === 0 ? (
          <p>You haven’t created any events yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
           {myCreatedEvents.map((event) => (
  <li
    key={event.id}
    style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px" }}
  >
    <h4>{event.title}</h4>
    <p>{event.description}</p>
    <p>
      Registrations: {event.registered_user_no} / {event.max_registrations}
    </p>
    <button onClick={() => navigate(`/events/edit/${event.id}`)}>
      Edit
    </button>
    <button
      onClick={() => handleDeleteEvent(event.id)}
      style={{ marginLeft: "10px", color: "red" }}
    >
      Delete
    </button>
  </li>
))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyEvents;
