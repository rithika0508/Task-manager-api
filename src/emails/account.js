const sgMail = require('@sendgrid/mail')




sgMail.setApiKey(process.env.SENDGRID_API_KEY)




const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rithikavijaykumar@gmail.com',
        subject:'Welcome',
        text:`Registered succesfully ${name}`
    })
}

const sendCancelMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rithikavijaykumar@gmail.com',
        subject: 'see you',
        text: `Goodbye!, see u soon ${name}`
    })
}
console.log('1')
// sendCancelMail('hendersonkookie@gmail.com', 'rits')
console.log('2')
module.exports = {
    sendWelcomeMail,
    sendCancelMail,
}
