const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
});
const upload = multer({ storage });


router.post("/", upload.array("images", 5), (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Login required" });
  const { title, description, price, maxRegistrations } = req.body;
  const images = req.files ? req.files.map(f => f.filename) : [];
  const createdBy = req.session.user.id;

  const sql = `INSERT INTO events (title, description, price, max_registrations, images, created_by) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [title, description, price, maxRegistrations, JSON.stringify(images), createdBy], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Event created", eventId: result.insertId });
  });
});


router.get("/", (req, res) => {
  const sql = `SELECT e.*, u.Name as created_by_name FROM events e JOIN users u ON e.created_by = u.Id ORDER BY e.created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch events", error: err });
    results.forEach(r => {
      const imgs = JSON.parse(r.images || "[]");
      r.image = imgs.length > 0 ? `http://localhost:5000/uploads/${imgs[0]}` : null;
    });
    res.json(results);
  });
});


router.get("/search", (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) return res.status(400).json({ error: "Search query is required" });

  const sql = `SELECT * FROM events WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? ORDER BY created_at DESC`;
  const searchPattern = `%${query}%`;
  db.query(sql, [searchPattern, searchPattern], (err, results) => {
    if (err) return res.status(500).json({ error: "Server error while searching", details: err });
    results.forEach(r => {
      const imgs = JSON.parse(r.images || "[]");
      r.image = imgs.length > 0 ? `http://localhost:5000/uploads/${imgs[0]}` : null;
    });
    res.json(results);
  });
});

router.get("/mine", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Login required" });
  const sql = `SELECT * FROM events WHERE created_by = ? ORDER BY created_at DESC`;
  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch my events", error: err });
    res.json(results);
  });
});


router.delete("/:id", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Login required" });
  const sql = `DELETE FROM events WHERE id = ? AND created_by = ?`;
  db.query(sql, [req.params.id, req.session.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete event", error: err });
    if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized" });
    res.json({ success: true, message: "Event deleted successfully" });
  });
});


router.put("/:id", upload.single("image"), (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Login required" });
  const eventId = req.params.id;
  const { title, description, price, max_registrations } = req.body;
  const newImage = req.file ? req.file.filename : null;

  const checkSql = `SELECT * FROM events WHERE id = ? AND created_by = ?`;
  db.query(checkSql, [eventId, req.session.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (results.length === 0) return res.status(403).json({ message: "Not allowed" });

    const currentImages = results[0].images ? JSON.parse(results[0].images) : [];
    const imagesToSave = newImage ? [newImage] : currentImages;

    const updateSql = `UPDATE events SET title=?, description=?, price=?, max_registrations=?, images=? WHERE id=? AND created_by=?`;
    db.query(updateSql, [title, description, price, max_registrations, JSON.stringify(imagesToSave), eventId, req.session.user.id], (err2) => {
      if (err2) return res.status(500).json({ message: "Update failed", error: err2 });
      res.json({ message: "Event updated successfully" });
    });
  });
});

module.exports = router;
