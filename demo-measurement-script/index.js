import { createClient } from "@extrahorizon/javascript-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const exh = createClient({
  host: process.env.API_HOST,
  consumerKey: process.env.API_OAUTH_CONSUMER_KEY,
  consumerSecret: process.env.API_OAUTH_CONSUMER_SECRET,
  token: process.env.API_OAUTH_TOKEN,
  tokenSecret: process.env.API_OAUTH_TOKEN_SECRET,
});

// Create heart rate
const heartRate = randomInteger(60, 180);
const heartRateVariability = randomInteger(20, 100);
const temperature = randomInteger(36, 40);
const timestamp = new Date().toISOString();

// Create PPG signal data
const ppgSignal = generatePpgSignal(heartRate);
const ppgFileContent = JSON.stringify(ppgSignal);

// Upload PPG signal
const ppgFile = await exh.files.create('ppg-signal.json', ppgFileContent);
const ppgFileToken = ppgFile.tokens[0].token;

// Post measurement
const measurement = await exh.data.documents.create('bio-measurement', {
  heartRate,
  heartRateVariability,
  temperature,
  ppgFileToken,
  timestamp,
});

console.log(`Created measurement "${measurement.id}" with heart rate ${heartRate}, heart rate variability ${heartRateVariability}, and temperature ${temperature}`);


// Helper functions

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePpgSignal(heartRate) {
  const duration = 60 * 1000;
  const sampleRate = 50;

  const heartBeatTime = 60 * 1000 / heartRate;
  const sampleDelay = 1000 / sampleRate;
  const offset = randomInteger(0, heartBeatTime);

  const signal = [];
  for (let time = 0; time < duration; time += sampleDelay) {
    // Add a sine wave with the heart rate frequency
    signal.push(Math.sin(((offset + time) / heartBeatTime) * 2 * Math.PI));
  }

  return signal;
}