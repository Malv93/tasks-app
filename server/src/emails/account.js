const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "marco.malvicini31@gmail.com",
    subject: "Welcome to the Task App",
    text: `Welcome ${name}! Let me know how you get along with the app.`,
  });
};

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "marco.malvicini31@gmail.com",
    subject: "Account deleted from the Task App",
    text: `Goodbye ${name}! We wish you all the best and we hope to see you soon.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail,
};
