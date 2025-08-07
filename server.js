import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { SMTPClient } from "emailjs";
dotenv.config();

const app = express();
app.use(bodyParser.json());

const client = new SMTPClient({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.EMAIL_HOST,
  ssl: true,
});

app.post("/api/auth/callback", (req, res) => {
  const payload = req.body;

  if (payload.hook?.event === "dm.version.added") {
    client.send(
      {
        text: `New File Version Added:\nFile name: ${payload.payload["custom-metadata"]["fileName"]}\nFile URN: ${payload.payload.source}\nFolder URN: ${payload.hook.scope.folder}\nUploaded by: ${payload.payload.modifiedBy}\nTimestamp: ${payload.payload.createdTime}`,

        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "New File Version Added",
      },
      (err, message) => {
        if (err) {
          console.error("Error sending email:", err);
          return res.status(500).send("Error sending email");
        }
        console.log("Email sent successfully:", message);
      }
    );
  }

  res.status(200).send("Webhook processed");
});

app.listen(8080, () => console.log(`Server running on http://localhost:8080`));
