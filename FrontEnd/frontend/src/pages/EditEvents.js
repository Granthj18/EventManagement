import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [maxRegistrations, setMaxRegistrations] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch("http://localhost:5000/api/events");
      const data = await res.json();
      const found = data.find((e) => e.id === parseInt(id));
      if (!found) {
        navigate("/myevents");
        return;
      }
      setEvent(found);
      setTitle(found.title);
      setDescription(found.description);
      setPrice(found.price);
      setMaxRegistrations(found.max_registrations);
    };
    fetchEvent();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("max_registrations", maxRegistrations);
    if (image) formData.append("image", image);

    const res = await fetch(`http://localhost:5000/api/events/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (res.ok) {
      alert("Event updated!");
      navigate("/myevents");
    } else {
      alert("Update failed.");
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div>
      <Header />
      <div style={{ padding: "20px" }}>
        <h2>Edit Event</h2>
        <form onSubmit={handleUpdate}>
          <p>
            <strong>Title:</strong> <br />
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </p>
          <p>
            <strong>Description:</strong> <br />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </p>
          <p>
            <strong>Price:</strong> <br />
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </p>
          <p>
            <strong>Max Registrations:</strong> <br />
            <input type="number" value={maxRegistrations} onChange={(e) => setMaxRegistrations(e.target.value)} />
          </p>
          <p>
            <strong>Image:</strong> <br />
            <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          </p>
          <button type="submit">Update Event</button>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;
