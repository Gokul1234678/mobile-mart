import React from "react";
import "../assets/styles/contact.css"
// Import images
import phoneIcon from "../assets/img/icons/phone.png";
import emailIcon from "../assets/img/icons/gmail.png";
import locationIcon from "../assets/img/icons/location.png";
import linkedinLogo from "../assets/img/icons/linkedin.png";
import instaLogo from "../assets/img/icons/insta.png";
import facebookLogo from "../assets/img/icons/f.png";

const ContactSection = () => {
  return (
    <>
    <div style={{padding:"20px"}}>
      {/* contact us start */}
      <div className="contact-container" id="contact">

        {/* LEFT SIDE - INFO */}
        <div className="contact-info">
          <h1 style={{ fontWeight: 600 }}>Contact us</h1>
          <h2 style={{ fontWeight: 500 }}>We're Here to Help!</h2>

          <div className="info-item">
            <img src={phoneIcon} alt="Phone Icon" />
            <a href="tel:+18004567890">+1-800-456-7890</a>
          </div>

          <div className="info-item">
            <img src={emailIcon} alt="Email Icon" />
            <a href="mailto:support@mobilemart.com">support@mobilemart.com</a>
          </div>

          <div className="info-item">
            <img src={locationIcon} alt="Location Icon" />
            <p>
              Mobile Mart HQ,<br />
              456 Innovation Street,<br />
              Tech City, CA 94043,<br />
              USA
            </p>
          </div>

          <hr />

          <div className="social-follow">
            <p>Follow me :</p>

            <a href="https://www.linkedin.com/in/gokul-selvan16" target="_blank" >
              <img src={linkedinLogo} alt="linkedin" />
            </a>

            <a href="https://www.instagram.com/" target="_blank">
              <img src={instaLogo} alt="Instagram" />
            </a>

            <a href="https://www.facebook.com/login/" target="_blank">
              <img src={facebookLogo} alt="Facebook" />
            </a>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="contact-form">
          <h2 style={{ fontWeight: 550 }}>Send a message</h2>

          <form action="https://api.web3forms.com/submit" method="POST">
            <input
              type="hidden"
              name="access_key"
              value="560063b9-cf54-4deb-af41-d89f217e249e"
            />

            <input type="text" name="Name" placeholder="Name" required />
            <input type="number" name="phone number" placeholder="Phone number" required />
            <input type="email" name="E-mail address" placeholder="E-mail address" required />
            <input type="text" name="Subject" placeholder="Subject" required />

            <textarea name="message" placeholder="Type your message here..." required></textarea>

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
      {/* contact us end */}
      </div>
    </>
  );
};

export default ContactSection;
