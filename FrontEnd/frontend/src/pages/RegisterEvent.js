import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import Header from "../Header/Header";
import "./RegisterEvents.css";

function RegisterEvent() {
  const { user } = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
  const [successMsg, setSuccessMsg] = useState(""); 

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        const data = await res.json();
        const selectedEvent = data.find((e) => e.id === parseInt(id));
        setEvent(selectedEvent);

        if (user && selectedEvent) {
          const regRes = await fetch("http://localhost:5000/api/registrations/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ eventId: selectedEvent.id }),
          });

          const result = await regRes.json();
          setAlreadyRegistered(result.registered);
        }
      } catch (err) {
        setErrorMsg(" Failed to fetch event details. Please try again later.");
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleCancel = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/registrations/cancel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId: event.id }),
      });

      if (res.ok) {
        setSuccessMsg("Registration cancelled successfully!");
        setAlreadyRegistered(false);

        const updatedEventRes = await fetch("http://localhost:5000/api/events");
        const eventsData = await updatedEventRes.json();
        const updatedEvent = eventsData.find((e) => e.id === event.id);
        if (updatedEvent) setEvent(updatedEvent);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.message || " Failed to cancel registration.");
      }
    } catch (err) {
      setErrorMsg("⚠️ Network error while cancelling registration.");
    }
  };

  if (!event) return <div style={{ padding: "20px" }}>Loading event...</div>;

  if (!user) {
    return (
      <div>
        <Header />
        <div style={{ padding: "20px" }}>
          <h2>Please login to register for this event</h2>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    );
  }

  const validateFields = () => {
    if (!name.trim()) {
      setErrorMsg("⚠️ Name is required.");
      return false;
    }
    if (!email.trim()) {
      setErrorMsg("⚠️ Email is required.");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMsg("⚠️ Please enter a valid email address.");
      return false;
    }
    setErrorMsg(""); 
    return true;
  };

  const handlePayment = async () => {
    if (!validateFields()) return; 

    try {
      setErrorMsg("");
      setSuccessMsg("");

      const transactionId = "TXN-" + Date.now();
      const payload = {
        user_id: user.id,
        event_id: event.id,
        name,
        email,
        transaction_id: transactionId,
      };

      const res = await fetch("http://localhost:5000/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccessMsg("🎉 Registration successful!");
        setTimeout(() => navigate("/myevents"), 1500);
      } else {
        setErrorMsg(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error while registering. Please try again later.");
    }
  };

  return (
    <div>
      <Header />
      <div className="register-container">
        <h2>{event.title}</h2>

        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            style={{ width: "300px", marginBottom: "20px" }}
          />
        )}

        {errorMsg && <p style={{ color: "red", fontWeight: "bold" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "green", fontWeight: "bold" }}>{successMsg}</p>}

        <p>
          <strong>Name:</strong>{" "}
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </p>

        {event.date && <p><strong>Date:</strong> {event.date}</p>}
        {event.price && <p><strong>Price:</strong> ${event.price}</p>}
        <p><strong>Description:</strong> {event.description}</p>

        <p>
          <strong>People Enrolled:</strong>{" "}
          {event.registered_user_no ?? 0}/{event.max_registrations ?? 0}
        </p>

        <div style={{ marginTop: "20px" }}>
  {alreadyRegistered ? (
    <div>
      <p style={{ color: "green", fontWeight: "bold" }}>
         You have already registered for this event.
      </p>
      <button
        style={{ background: "red", color: "white", marginTop: "10px" }}
        onClick={handleCancel}
      >
        Cancel Registration
      </button>
    </div>
  ) : event.registered_user_no >= event.max_registrations ? (
   
    <p style={{ color: "red", fontWeight: "bold" }}>
       Registrations Full. Cannot register for this event.
    </p>
  ) : (
    <>
      {!confirmed ? (
        <button onClick={() => setConfirmed(true)}>Confirm</button>
      ) : (
        <button onClick={handlePayment}>Pay Now</button>
      )}
    </>
  )}
</div>

      </div>
    </div>
  );
}

export default RegisterEvent;
