import { useState, useContext } from "react";
import Header from "../Header/Header";
import { UserContext } from "../UserContext";
import "./CreateEvent.css";

function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    maxRegistrations: "",
    images: [],
  });
  const [errors, setErrors] = useState({});
  const { user } = useContext(UserContext);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2);
    setForm({ ...form, images: files });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.price || isNaN(form.price) || Number(form.price) < 0)
      newErrors.price = "Price is incorrect";
    if (!form.maxRegistrations || isNaN(form.maxRegistrations) || Number(form.maxRegistrations) <= 0)
      newErrors.maxRegistrations = "Maximum Registrations is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // true if valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setErrors({ form: "Login required!" });
      return;
    }

    if (!validateForm()) return;

    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("price", form.price);
    data.append("maxRegistrations", form.maxRegistrations);

    if (form.images.length > 0) {
      form.images.forEach((img) => data.append("images", img));
    }

    try {
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        credentials: "include",
        body: data,
      });

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        setErrors({ form: result.message || "Failed to create event" });
        return;
      }

      alert("Event created successfully!");
      setForm({ title: "", description: "", price: "", maxRegistrations: "", images: [] });
      setErrors({});
    } catch (err) {
      console.error(err);
      setErrors({ form: "Server unavailable. Please try again later." });
    }
  };

  return (
    <div>
      <Header />
      <div className="create-event-container">
        <h2>Create Event</h2>
        <form onSubmit={handleSubmit} className="event-form">
         

          <label>Title</label>
          <input name="title" value={form.title} onChange={handleInputChange} />
          {errors.title && <div className="error">{errors.title}</div>}

          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleInputChange} />
          {errors.description && <div className="error">{errors.description}</div>}

          <label>Price</label>
          <input name="price" type="number" value={form.price} onChange={handleInputChange} />
          {errors.price && <div className="error">{errors.price}</div>}

          <label>Maximum Registrations</label>
          <input name="maxRegistrations" type="number" value={form.maxRegistrations} onChange={handleInputChange} />
          {errors.maxRegistrations && <div className="error">{errors.maxRegistrations}</div>}

          <label>Upload Images (Max 2, optional)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />

          <button type="submit">Create Event</button>
          {errors.form && <div className="error">{errors.form}</div>}
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
