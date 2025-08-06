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
  port: 587,
  ssl: false,
  tls: true,
});

app.post("/api/auth/callback", (req, res) => {
  const payload = req.body;

  if (!payload || payload.hook?.event !== "dm.version.added") {
    console.error("Invalid event type:", payload.hook.event);
    return res.status(400).send("Invalid event type");
  }

  console.log("New File Version Added:");
  console.log("File name:", payload.payload["custom-metadata"]["fileName"]);
  console.log(`File URN: ${payload.payload.source}`);
  console.log(`Folder URN: ${payload.hook.scope.folder}`);
  console.log(`Uploaded by: ${payload.payload.modifiedBy}`);
  console.log(`Timestamp: ${payload.payload.createdTime}`);

  client.send(
    {
      text: `New File Version Added:\nFile name: ${payload.payload["custom-metadata"]["fileName"]}\nFile URN: ${payload.payload.source}\nFolder URN: ${payload.hook.scope.folder}\nUploaded by: ${payload.payload.modifiedBy}\nTimestamp: ${payload.payload.createdTime}`,

      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New File Version Notification",
    },
    (err, message) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).send("Error sending email");
      }
      console.log("Email sent successfully:", message);
    }
  );

  res.status(200).send("Webhook processed");
});

app.listen(8080, () => console.log(`Server running on http://localhost:8080`));
