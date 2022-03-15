const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const transporter = require('../../configs/mail');
const mjml2html = require('mjml');


class MailService {
  
  /**
   * @param {Object} request
   * @param {Object} response
   * @param {String} receiver - Target email
   */
  static async sendVerificationCode(request, response, receiver) {
    const representer = process.env.PRODUCT_NAME ? `[${process.env.PRODUCT_NAME}]` : '';
    const senderAddress = transporter.options.auth.user || process.env.MAIL_ACCOUNT;

    if (!senderAddress) 
      throw new Error('Sender email address is not provided.');
    
    const template = path.resolve(__dirname, 'template', 'verification_code.hbs');
    const source = fs.readFileSync(template, 'utf8');
    const compile = hbs.handlebars.compile(source);
    const mailtemplate = compile(response.locals);
    const document = mjml2html(mailtemplate).html;

    const mail = {
      from: senderAddress,
      to: receiver,
      subject: `${representer} Account Verification`,
      html: document,
    }

    transporter.sendMail(mail);
  }

}


module.exports = MailService;
