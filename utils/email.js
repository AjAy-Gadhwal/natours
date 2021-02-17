const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user, url)

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
        this.url = url;
    }

    createTransport() {
        if (process.env.NODE_ENV === 'production') {
            return 1;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        try {
            const emailHtml = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
                firstName: this.firstName,
                url: this.url,
                subject: subject
            });

            const mailOptions = {
                form: this.from,
                to: this.to,
                subject: subject,
                html: emailHtml,
                text: htmlToText.fromString(emailHtml)
            };

            await this.createTransport().sendMail(mailOptions);
        } catch (error) {
            console.log(error);
        }
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the natour family!');
    }

    async sendResetPassword() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)!');
    }
};
