const express = require("express");
const cors = require("cors");
const db = require("./db");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const path = require("path");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const sessionStore = new MySQLStore({}, db.promise());
app.use(
  session({
    key: "user_session",
    secret: "supersecretkey",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000, httpOnly: true, secure: false, sameSite: "lax" },
  })
);


app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/events", require("./routes/events"));
app.use("/api/registrations", require("./routes/registrations"));

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
