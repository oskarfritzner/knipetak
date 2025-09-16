import "./Footer.css";
import logo from "../../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareFacebook,
  faSquareInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Logo Section */}
        <div className="footer-section">
          <img src={logo} alt="Knipetak Logo" className="footer-logo" />
          <p>Bergens lokale muskelterapaut på hjul</p>
        </div>

        {/* Contact Section */}
        <div className="footer-section">
          <h4>Kontakt Oss</h4>
          <a href="mailto:post@knipetak.no" className="footer-link">
            <FontAwesomeIcon icon={faEnvelope} /> post@knipetak.no
          </a>
          <a href="tel:+4747474747" className="footer-link">
            <FontAwesomeIcon icon={faPhone} /> +47 474 74 747
          </a>
        </div>

        {/* Social Media Section */}
        <div className="footer-section">
          <h4>Følg Oss</h4>
          <div className="social-links">
            <a
              href="https://www.facebook.com/profile.php?id=61553937311909"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Besøk vår Facebook side"
            >
              <FontAwesomeIcon icon={faSquareFacebook} />
            </a>
            <a
              href="https://www.instagram.com/knipetak.no/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Følg oss på Instagram"
            >
              <FontAwesomeIcon icon={faSquareInstagram} />
            </a>
          </div>
        </div>

        {/* Legal Links Section */}
        <div className="footer-section">
          <h4>Informasjon</h4>
          <a href="/terms" className="footer-link">
            Vilkår for bruk
          </a>
          <a href="/personvern" className="footer-link">
            Personvern
          </a>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Knipetak. Alle rettigheter
          reservert.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
