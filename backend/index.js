const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const app = express();

// 1. Middlewares (Must be first)
app.use(cors());
app.use(express.json());

// 2. MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/passkey")
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.log("MongoDB Connection failed...", err));

// 3. Define the Schema for your Credentials
const credential = mongoose.model("credential", {}, "bulkmail");

// 4. The Bulk Email Route
app.post("/sendemail", async function(req, res) {
    const { msg, emailList } = req.body;

    try {
        // Find credentials in the database first
        const data = await credential.find();
        
        if (!data || data.length === 0) {
            return res.status(500).send("No credentials found in database");
        }

        // Configure transporter with data from DB
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: data[0].toJSON().user,
                pass: data[0].toJSON().pass 
            },
        });

        // Loop through and send emails
        for (let i = 0; i < emailList.length; i++) {
            await transporter.sendMail({
                from: data[0].toJSON().user,
                to: emailList[i],
                subject: "Bulk Message via BulkMail",
                text: msg
            });
            console.log("Sent to: " + emailList[i]);
        }

        res.send("sent");
    } catch (error) {
        console.error(error);
        res.status(500).send("error");
    }
});

// 5. Start Server
app.listen(5000, function() {
    console.log("Server started on port 5000...");
});