const express = require("express");
const router = express.Router();
const db = require("../db");


router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];
    req.session.user = { id: user.Id, name: user.Name, email: user.Email };
    req.session.save(() => res.json({ loggedIn: true, user: req.session.user, message: "Login successful" }));
  });
});


router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("user_session");
    res.json({ message: "Logged out successfully" });
  });
});


router.get("/session", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.session.user) res.json({ loggedIn: true, user: req.session.user });
  else res.json({ loggedIn: false });
});

module.exports = router;
