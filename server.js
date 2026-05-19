const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ================= WEBSITE ================= */

app.use(express.static(__dirname));

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );
});

/* ================= USERS FILE ================= */

const FILE = path.join(__dirname, "users.json");

/* ================= LOAD USERS ================= */

function loadUsers() {

    if (!fs.existsSync(FILE)) {

        return [];
    }

    return JSON.parse(
        fs.readFileSync(FILE, "utf8")
    );
}

/* ================= SAVE USERS ================= */

function saveUsers(users) {

    fs.writeFileSync(
        FILE,
        JSON.stringify(users, null, 2)
    );
}

/* ================= LOGIN ================= */

app.post("/login", (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    let users = loadUsers();

    let user = users.find(
        u => u.username === username
    );

    // NO USER
    if (!user) {

        return res.json({
            error: "no_user"
        });
    }

    // WRONG PASSWORD
    if (user.password !== password) {

        return res.json({
            error: "wrong_password"
        });
    }

    // SUCCESS
    res.json({

        success: true,

        username: user.username,

        score: user.score
    });
});

/* ================= SIGN UP ================= */

app.post("/signup", (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    let users = loadUsers();

    let exists = users.find(
        u => u.username === username
    );

    // USER EXISTS
    if (exists) {

        return res.json({
            error: "exists"
        });
    }

    // CREATE USER
    users.push({

        username: username,

        password: password,

        score: 0
    });

    saveUsers(users);

    res.json({
        success: true
    });
});

/* ================= SAVE SCORE ================= */

app.post("/saveScore", (req, res) => {

    let username = req.body.username;
    let score = req.body.score;

    let users = loadUsers();

    let user = users.find(
        u => u.username === username
    );

    // USER NOT FOUND
    if (!user) {

        return res.json({
            success: false
        });
    }

    // SAVE SCORE
    user.score = score;

    saveUsers(users);

    res.json({
        success: true
    });
});

/* ================= LEADERBOARD ================= */

app.get("/leaderboard", (req, res) => {

    let users = loadUsers();

    let sorted = users

        .filter(u => u.score > 0)

        .sort((a, b) => b.score - a.score)

        .slice(0, 10);

    res.json(sorted);
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {

    console.log(
        "Server running on port " + PORT
    );
});
