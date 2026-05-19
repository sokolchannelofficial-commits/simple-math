const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));


const FILE = path.join(__dirname, "users.json");

// LOAD USERS
function loadUsers() {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

// SAVE USERS
function saveUsers(users) {
    fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {

    let { username, password } = req.body;

    let users = loadUsers();

    let user = users.find(u => u.username === username);

    if (!user) {
        return res.json({ error: "no_user" });
    }

    if (user.password !== password) {
        return res.json({ error: "wrong_password" });
    }

    res.json({
        success: true,
        username: user.username,
        score: user.score
    });
});

/* ================= SIGNUP ================= */
app.post("/signup", (req, res) => {

    let { username, password } = req.body;

    let users = loadUsers();

    let exists = users.find(u => u.username === username);

    if (exists) {
        return res.json({ error: "exists" });
    }

    users.push({
        username,
        password,
        score: 0
    });

    saveUsers(users);

    res.json({ success: true });
});

/* ================= SAVE SCORE ================= */
app.post("/saveScore", (req, res) => {

    let { username, score } = req.body;

    let users = loadUsers();

    let user = users.find(u => u.username === username);

    if (!user) return res.json({ success: false });

    user.score = score;

    saveUsers(users);

    res.json({ success: true });
});

/* ================= LEADERBOARD ================= */
app.get("/leaderboard", (req, res) => {

    let users = loadUsers();

    let sorted = users
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    res.json(sorted);
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
