import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("YouTube Downloader API Running 🚀");
});

app.get("/api", (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.json({ error: "URL required" });
  }

  // yt-dlp command (get video info + direct links)
  const command = `yt-dlp -j ${url}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.json({ error: "Failed to fetch video" });
    }

    try {
      const data = JSON.parse(stdout);

      const response = {
        title: data.title,
        thumbnail: data.thumbnail,
        duration: data.duration,
        formats: data.formats
          .filter(f => f.ext === "mp4" && f.format_note)
          .map(f => ({
            quality: f.format_note,
            url: f.url
          })),
        audio: data.formats
          .filter(f => f.ext === "m4a")
          .map(f => ({
            type: "audio",
            url: f.url
          }))
      };

      res.json(response);
    } catch {
      res.json({ error: "Parsing failed" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
