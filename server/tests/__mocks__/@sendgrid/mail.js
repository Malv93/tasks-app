//I must mock all the modules I am using from @sendgrid/mail
//and exports them

module.exports = {
  setApiKey() {},
  send() {},
};

//Now we are not sendig emails from sendgrid account when we run tests
