import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./ContactPage.css";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

function ContactPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update email when user changes (e.g., after login)
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setError("");
    setSuccess("");

    if (id === "message") setMessage(value);
    if (id === "email") setEmail(value); // Allow email updates for all users
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!email.trim()) {
      setError("E-post er påkrevd");
      setIsLoading(false);
      return;
    }

    if (!message.trim()) {
      setError("Beskjed er påkrevd");
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ugyldig e-postadresse");
      setIsLoading(false);
      return;
    }

    console.log("Attempting to send email with:", { email, message });
    console.log("Using Service ID:", "service_sstnsjr");
    console.log("Using Template ID:", "template_t3u03cl");

    try {
      const templateParams = {
        name: user?.displayName || email.split("@")[0],
        email,
        message,
      };

      console.log("Template params:", templateParams);

      const result = await emailjs.send(
        "service_sstnsjr", // Correct service ID confirmed
        "template_t3u03cl", // Correct template ID (working)
        templateParams,
        "QbsqRNA19P8VBkMBZ"
      );

      console.log("EmailJS result:", result);
      setSuccess("Meldingen din har blitt sendt!");
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));

      // More specific error messages
      if (err instanceof Error) {
        setError(`Feil ved sending: ${err.message}`);
      } else {
        setError("Kunne ikke sende meldingen. Sjekk konsollen for detaljer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-box">
        <h1>Kontakt Oss</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="contact-info">
          <p className="contact-info__text">Tlf: +47 32 55 64 22</p>
          <div className="contact-info__divider"></div>
          <p className="contact-info__text">Epost: Post@Knipetak.no</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-post</label>
            <textarea
              id="email"
              value={email}
              onChange={handleInputChange}
              className="form-input form-input--short"
              placeholder={
                user
                  ? "Endre e-postadresse for svar"
                  : "Skriv e-postadressen din"
              }
              required
              disabled={isLoading} // Only disable during loading
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Beskjed</label>
            <textarea
              id="message"
              value={message}
              onChange={handleInputChange}
              className="form-input form-input--tall"
              placeholder="Skriv meldingen din her"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Send Beskjed</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactPage;
