const express = require("express");
const router = express.Router();
const db = require("../db");


router.post("/", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Login required" });
  const { event_id } = req.body;
  if (!event_id) return res.status(400).json({ message: "Invalid registration request" });

  const user_id = req.session.user.id;
  const tickets = 1;
  const transaction_id = `TXN-${Date.now()}-${user_id}`;

  const checkEventSql = `SELECT created_by, registered_user_no, max_registrations FROM events WHERE id = ?`;
  db.query(checkEventSql, [event_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error", error: err });
    if (results.length === 0) return res.status(404).json({ message: "Event not found" });

    const event = results[0];
    if (event.created_by === user_id) return res.status(400).json({ message: "Cannot register own event" });

    const checkUserSql = `SELECT * FROM registrations WHERE user_id = ? AND event_id = ?`;
    db.query(checkUserSql, [user_id, event_id], (err2, regResults) => {
      if (err2) return res.status(500).json({ message: "Server error", error: err2 });
      if (regResults.length > 0) return res.status(400).json({ message: "Already registered" });
      if (event.registered_user_no + tickets > event.max_registrations) return res.status(400).json({ message: "Not enough slots" });

      const insertSql = `INSERT INTO registrations (user_id, event_id, tickets, transaction_id) VALUES (?, ?, ?, ?)`;
      db.query(insertSql, [user_id, event_id, tickets, transaction_id], (err3, result) => {
        if (err3) return res.status(500).json({ message: "Registration failed", error: err3 });

        const updateSql = `UPDATE events SET registered_user_no = registered_user_no + 1 WHERE id = ?`;
        db.query(updateSql, [event_id], (err4) => {
          if (err4) return res.status(500).json({ message: "Failed to update event count", error: err4 });
          res.status(201).json({ id: result.insertId, event_id, tickets, transaction_id, message: "Registration successful" });
        });
      });
    });
  });
});


router.post("/check", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Login required" });
  const { eventId } = req.body;
  const userId = req.session.user.id;

  const sql = `SELECT * FROM registrations WHERE user_id = ? AND event_id = ? LIMIT 1`;
  db.query(sql, [userId, eventId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (results.length > 0) return res.json({ registered: true, registration: results[0] });
    res.json({ registered: false });
  });
});


router.delete("/cancel", (req, res) => {
  const { eventId } = req.body;
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ message: "Login required" });

  const deleteSql = `DELETE FROM registrations WHERE user_id = ? AND event_id = ?`;
  db.query(deleteSql, [userId, eventId], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to cancel registration", error: err });
    if (result.affectedRows === 0) return res.status(400).json({ message: "Not registered" });

    const updateSql = `UPDATE events SET registered_user_no = registered_user_no - 1 WHERE id = ? AND registered_user_no > 0`;
    db.query(updateSql, [eventId]);
    res.json({ message: "Registration cancelled successfully" });
  });
});


router.get("/mine", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Login required" });
  const sql = `SELECT r.*, e.title, e.description, e.price FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.user_id = ? ORDER BY r.registration_date DESC`;
  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch registrations", error: err });
    res.json(results);
  });
});


router.get("/event/:eventId", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const { eventId } = req.params;
  const sql = "SELECT * FROM registrations WHERE event_id = ?";
  db.query(sql, [eventId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch registrations", error: err });
    res.json(results);
  });
});

module.exports = router;
