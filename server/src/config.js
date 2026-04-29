const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

const FORM_URL = process.env.FORM_URL;

if (!FORM_URL) {
  throw new Error("Missing FORM_URL environment variable");
}

const SERVICE_AREAS = ["Branch Ambience", "Branch Staff", "ATM"];
const PORT = Number(process.env.PORT || 10000);
const HEADLESS = process.env.HEADLESS !== "false";
const NAVIGATION_TIMEOUT = 45000;
const ACTION_DELAY_MIN = 500;
const ACTION_DELAY_MAX = 1500;
const FIXED_STATE = "Lagos State";
const FIXED_BRANCH = "Surulere Branch (Adeniran Ogunsanya Street)";
const FIXED_RATING = 10;
const FIXED_FEEDBACK = "No issues";

module.exports = {
  ACTION_DELAY_MAX,
  ACTION_DELAY_MIN,
  FIXED_BRANCH,
  FIXED_FEEDBACK,
  FIXED_RATING,
  FIXED_STATE,
  FORM_URL,
  HEADLESS,
  NAVIGATION_TIMEOUT,
  PORT,
  SERVICE_AREAS,
};
