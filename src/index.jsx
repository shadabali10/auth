const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { handleLoginRequest } = require("./routes/routerHandler.jsx");
const { handleSignupRequest } = require("./routes/routerHandler.jsx");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

async function sectorScaping() {
  console.info("sectorScaping starting");
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.goto("https://www.investindia.gov.in/sectors");
    const html = await page.content();
    console.info("Page content retrieved");
    await browser.close();
    console.info("Browser closed");

    const $ = cheerio.load(html);
    console.info("Cheerio loaded");

    const data = $("a")
      .map((_, element) => {
        const href = $(element).attr("href");
        const text = $(element).text();
        if (
          href &&
          href.startsWith("/sector") &&
          !text.includes("VISIT SECTOR")
        )
          return { href, text };
      })
      .get()
      .filter(Boolean);

    console.log("Links data:");
    // console.log(data);

    let sectors = new Set();

    $(".listing-title-wrapper").each((_, element) => {
      const sectorName = $(element).children("h3").first().text().trim();
      const sectorData = [];

      $(element)
        .find("div.inner")
        .each((_, stat) => {
          const text = $(stat).text();
          if (text.includes("Foreign")) {
            sectorData.push(text);
          }
        });

      if (sectorData.length > 0) {
        sectors.add({ sector: sectorName, data: sectorData });
      }
    });

    console.log("Sectors data:");
    console.log(Array.from(sectors));
  } catch (error) {
    console.error("Error scraping data:", error);
    await browser.close();
  }
}

sectorScaping();

app.post("./signup", handleSignupRequest);
app.get("/", handleLoginRequest);

mongoose
  .connect("mongodb://localhost:27017/auth", { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to DB");

    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.error("Error connecting to DB:", err);
  });
