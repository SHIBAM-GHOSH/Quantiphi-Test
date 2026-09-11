require("dotenv").config();

const db = require("./db");
const express = require("express");

const app = express();

app.use(express.json());

console.log(
    process.env.EXCHANGE_RATE_API_KEY
        ? "API key loaded"
        : "API key missing"
);

app.get("/", (req, res) => {
    res.send("Currency Converter Backend is running");
});


// Convert Currency
app.get("/api/convert", async (req, res) => {
    const amount = Number(req.query.amount);
    const from = req.query.from;
    const to = req.query.to;

    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`
    );

    const data = await response.json();

    const rate = data.conversion_rates[to];

    const result = amount * rate;

    const sql = `
        INSERT INTO conversion_history
        (from_currency, to_currency, amount, exchange_rate, result)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [from, to, amount, rate, result],
        (err) => {
            if (err) {
                console.log(
                    "Failed to save conversion:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Conversion worked, but saving history failed"
                });
            }

            res.json({
                from: from,
                to: to,
                amount: amount,
                rate: rate,
                result: result
            });
        }
    );
});


// Get Conversion History
app.get("/api/history", (req, res) => {
    const sql = `
        SELECT *
        FROM conversion_history
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.log(
                "Failed to fetch history:",
                err.message
            );

            return res.status(500).json({
                message: "Failed to fetch conversion history"
            });
        }

        res.json(results);
    });
});


app.listen(5000, () => {
    console.log("Server running on port 5000");
});