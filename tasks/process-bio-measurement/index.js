import { createClient } from "@extrahorizon/javascript-sdk";

const exh = createClient({
  host: process.env.API_HOST,
  consumerKey: process.env.API_OAUTH_CONSUMER_KEY,
  consumerSecret: process.env.API_OAUTH_CONSUMER_SECRET,
  token: process.env.API_OAUTH_TOKEN,
  tokenSecret: process.env.API_OAUTH_TOKEN_SECRET,
});

export async function handler(task) {
  const measurement = await exh.data.documents.findById(task.data.schemaId, task.data.documentId);

  if (measurement.data.heartRate > 120) {
    const template = await exh.templates.findByName('heart-rate-alert-email');
    const patient = await exh.users.findById(measurement.creatorId);
    
    await exh.mails.send({
      recipients: {
        to: [patient.email],
      },
      templateId: template.id,
      content: {
        patientFirstName: patient.firstName,
        heartRate: measurement.data.heartRate,
      }
    })
  }
}