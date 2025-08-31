import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import './SearchResult.css';


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const query = useQuery().get("q") || "";
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/events/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed to fetch search results");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        alert("Error fetching search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchSearchResults();
  }, [query]);

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div>
      <Header />
      <div className="search-container">
        <h2>Search results for "{query}"</h2>
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
            <ul className="events-list">
            {events.map((event) => (
              <li key={event.id} className="event-item">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                {event.image && <img src={event.image} alt={event.title} />}
                <p>Price: ${event.price ?? 0}</p>
                <button onClick={() => navigate(`/event/${event.id}`)}>View Event</button>
              </li>
            ))}
          </ul>
          
        )}
      </div>
    </div>
  );
}

export default SearchResults;
