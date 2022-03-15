const nodemailer = require('nodemailer');


const transport = {
  host: process.env.MAIL_STMP_SERVER || 'smtp.gmail.com',
  port: process.env.MAIL_STMP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_ACCOUNT,
    pass: process.env.MAIL_PASSWORD,
  }
}

const transporter = nodemailer.createTransport(transport);

transporter.useAlternativeTransporter = function useAlternativeTransporter(transport = {}) {
  const cloneTransport = Object.assign({}, transport);
  const overwrittenTransport = Object.assign(cloneTransport, transport);
  return nodemailer.createTransport(overwrittenTransport);
}


module.exports = transporter;
