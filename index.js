// Importing required libraries and modules
const express = require("express"); // Importing the Express framework
const app = express(); // Creating an instance of Express
const nodemailer = require("nodemailer"); // Importing Nodemailer for sending emails
const uuid = require("uuid"); // Importing UUID for generating unique identifiers

// Setting up nodemailer for email functionality
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "mr.jonior1992@gmail.com",
    accessToken:
      "ya29.a0AfB_byBCo7iKDrV5ezjrzS-1om6_mSzF2oh6NNayIUKMghxTTntUPeV4mUG_rxaT7s6l22wRCYjDA6m59Nkv_QsCW3RxpTTvbRRKWhGFa2xD5c_l-ba__B1L1qrl-HzcG1kBPcskWbiNy0kLTmU1KcoRwepxv_xyI7i-aCgYKAVESARESFQGOcNnC_5x4Y0O8DwxvSuh0f0icog0171", // Be careful with sharing sensitive information like access tokens
  },
});

// Array of user objects with their information
const users = [
  {
    id: 1,
    email: "m.syrmani@gmail.com",
    magicCode: null, // A placeholder for magic codes
    pinCode: "1234",
    smiley1: "😊",
    smiley2: "😄",
    smiley3: "😁",
  },
  {
    id: 2,
    email: "modisermani@gmail.com",
    magicCode: null,
    pinCode: "5678",
    smiley1: "😁",
    smiley2: "😊",
    smiley3: "😄",
  },
];

// Starting the server and listening on port 5000
app.listen(5000, () => {
  console.log("app is listening on port 5000");
});

// Using JSON middleware for handling request bodies
app.use(express.json());

// Serving the root URL with an HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // Sending a file as the response
});

// Handling requests to the dashboard
app.get("/dashboard", (req, res) => {
  const { email, code } = req.query; // Extracting email and code from the query parameters
  const user = users.find((u) => u.email === email && u.magicCode === code); // Finding a user based on provided email and code

  if (user) {
    // user.magicCode = null; // Uncomment if you want to reset the magic code after successful login
    res.sendFile(__dirname + "/dashboard.html"); // Sending the dashboard HTML if user is found
  } else {
    res.status(403).send("Invalid magic code or email."); // Sending a 403 error if user is not found
  }
});

// Handling login requests
app.post("/login", async (req, res) => {
  const { email, pinCode, smiley1, smiley2, smiley3, loginMethod } = req.body; // Extracting data from the request body
  const user = users.find((u) => u.email === email); // Finding a user based on provided email

  if (!user) {
    return res.send("User not found"); // Sending a response if user is not found
  }

  if (loginMethod === "pin") {
    if (user.pinCode !== pinCode) {
      return res.send("Incorrect pin code"); // Sending a response if PIN code is incorrect
    }
  } else if (loginMethod === "link") {
    // if (user.magicCode) {
    //   return res.send("Magic Link already sent. Check your email."); // Sending a response if magic link has already been sent
    // } else {
    // }
    const magicCode = uuid.v4().substr(0, 8); // Generating a magic code
    user.magicCode = magicCode; // Assigning the magic code to the user

    const mailOptions = {
      from: "mr.jonior1992@gmail.com",
      to: email,
      subject: "Magic Link Login Auth",
      html: `<p> Click the link below to log in </p>
         <a href="http://localhost:5000/dashboard?email=${encodeURIComponent(
           email
         )}&code=${encodeURIComponent(magicCode)}"> Log in</a>`, // Creating the email content
    };

    try {
      await transport.sendMail(mailOptions); // Sending the email
      return res.send("Magic Link sent to your email"); // Sending a response after email is sent
    } catch (err) {
      console.log(err);
      return res.send("Error sending Email"); // Handling errors while sending email
    }
  } else if (loginMethod === "stickers") {
    if (
      user.smiley1 !== smiley1 ||
      user.smiley2 !== smiley2 ||
      user.smiley3 !== smiley3
    ) {
      return res.send("Incorrect smiley codes"); // Sending a response if smiley codes are incorrect
    }
  }

  user.magicCode = null; // Resetting magic code after successful login
  return res.send("Welcome to the dashboard"); // Sending a welcome message after successful login
});
