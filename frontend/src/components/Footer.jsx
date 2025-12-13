import React from "react";
import "../assets/styles/footer.css"
const Footer = () => {
  return (
    <>
      {/* footer starts */}
      <footer id="footer" className="bg-dark text-white pt-4">
        <div className="container">
          <div className="row">
            {/* About Us */}
            <div className="col-md-4">
              <h5>About Us</h5>
              <p>
                Mobile Mart is your one-stop destination for the latest smartphones. 
                Explore top brands and unbeatable deals with us.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-md-2">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-white text-decoration-none">Home</a></li>
                <li><a href="#" className="text-white text-decoration-none">Shop</a></li>
                <li><a href="#" className="text-white text-decoration-none">Contact Us</a></li>
                {/* <li><a href="#" className="text-white text-decoration-none">FAQs</a></li> */}
                <li><a href="#" className="text-white text-decoration-none">Terms of Service</a></li>
                <li><a href="#" className="text-white text-decoration-none">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="col-md-3">
              <h5>Customer Service</h5>
              <p><strong>Email:</strong> support@mobilemart.com</p>
              <p><strong>Phone:</strong> +1-800-456-7890</p>
              <p><strong>Hours:</strong> Mon - Fri | 9 AM - 6 PM</p>
            </div>

            {/* Newsletter */}
            <div className="col-md-3">
              <h5>Newsletter</h5>
              <p>Enter your email to stay updated with our latest offers!</p>
              <form>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your email"
                    aria-label="Email"
                  />
                  <button className="btn btn-primary" type="submit">
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>

          <hr className="my-4 bg-light" />

          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0">© {new Date().getFullYear()} Mobile Mart. All rights reserved.</p>

            </div>

            <div className="col-md-6 text-center text-md-end">
              <a href="https://www.facebook.com/login/" target="_blank" className="text-white me-3">
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href="https://www.instagram.com"
                className="text-white me-3"  target="_blank"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white me-3" target="_blank">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.linkedin.com/in/gokul-selvan16" target="_blank" className="text-white">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
      {/* footer end */}
    </>
  );
};

export default Footer;
