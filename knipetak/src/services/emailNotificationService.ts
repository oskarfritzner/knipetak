import emailjs from "@emailjs/browser";
import { BookingData } from "../backend/interfaces/BookingData";

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

class EmailNotificationService {
  private config: EmailConfig = {
    serviceId: "service_sstnsjr", // Correct service ID confirmed
    templateId: "template_t3u03cl", // Correct template ID (working)
    publicKey: "QbsqRNA19P8VBkMBZ", // Correct public key
  };

  /**
   * Sends email notification to Helene about new booking
   */
  async sendNewBookingNotification(bookingData: BookingData): Promise<void> {
    try {
      const templateParams = {
        email: bookingData.customerEmail, // Match template variable
        message: this.formatNewBookingMessage(bookingData),
        name: bookingData.customerName, // Match template variable
      };

      console.log("📧 Sending new booking notification:", templateParams);
      console.log("EmailJS config:", {
        serviceId: this.config.serviceId,
        templateId: this.config.templateId,
        publicKey: this.config.publicKey?.slice(0, 4) + "***",
      });

      const result = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
        this.config.publicKey
      );

      console.log("✅ New booking notification sent successfully:", result);
    } catch (error) {
      console.error("❌ Failed to send new booking notification:", error);
      // Don't throw error to avoid breaking booking process
    }
  }

  /**
   * Sends email notification to Helene about cancelled booking
   */
  async sendCancelledBookingNotification(
    bookingData: BookingData
  ): Promise<void> {
    try {
      const templateParams = {
        email: bookingData.customerEmail, // Match template variable
        message: this.formatCancelledBookingMessage(bookingData),
        name: bookingData.customerName, // Match template variable
      };

      console.log("📧 Sending cancelled booking notification:", templateParams);
      console.log("EmailJS config:", {
        serviceId: this.config.serviceId,
        templateId: this.config.templateId,
        publicKey: this.config.publicKey?.slice(0, 4) + "***",
      });

      const result = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
        this.config.publicKey
      );

      console.log(
        "✅ Cancelled booking notification sent successfully:",
        result
      );
    } catch (error) {
      console.error("❌ Failed to send cancelled booking notification:", error);
      // Don't throw error to avoid breaking cancellation process
    }
  }

  /**
   * Formats the message for new booking notifications
   */
  private formatNewBookingMessage(bookingData: BookingData): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("nb-NO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return `🎉 NY BOOKING MOTTATT!

Kunde: ${bookingData.customerName}
E-post: ${bookingData.customerEmail}
Telefon: ${bookingData.customerPhone || "Ikke oppgitt"}

📅 Dato: ${formatDate(bookingData.date)}
⏰ Tid: ${formatTime(bookingData.timeslot.start)} - ${formatTime(
      bookingData.timeslot.end
    )}
⏱️ Varighet: ${bookingData.duration} minutter

📍 Adresse:
${bookingData.location.address}
${bookingData.location.postalCode} ${bookingData.location.city}

💰 Pris: ${bookingData.price} kr
📋 Status: ${bookingData.status}
💳 Betaling: ${bookingData.paymentStatus ? "Betalt" : "Ikke betalt"}

${
  bookingData.customerMessage
    ? `💬 Kundens melding:
"${bookingData.customerMessage}"`
    : ""
}

${
  bookingData.isGuestBooking
    ? "👤 Dette er en gjestebooking (kunde har ikke konto)"
    : "👤 Kunde har registrert konto"
}

---
Dette er en automatisk melding fra Knipetak booking-systemet.
Du kan svare direkte på denne e-posten for å kontakte kunden.`;
  }

  /**
   * Formats the message for cancelled booking notifications
   */
  private formatCancelledBookingMessage(bookingData: BookingData): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("nb-NO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return `❌ BOOKING KANSELLERT

Kunde: ${bookingData.customerName}
E-post: ${bookingData.customerEmail}
Telefon: ${bookingData.customerPhone || "Ikke oppgitt"}

📅 Opprinnelig dato: ${formatDate(bookingData.date)}
⏰ Opprinnelig tid: ${formatTime(bookingData.timeslot.start)} - ${formatTime(
      bookingData.timeslot.end
    )}
⏱️ Varighet: ${bookingData.duration} minutter

📍 Adresse som skulle besøkes:
${bookingData.location.address}
${bookingData.location.postalCode} ${bookingData.location.city}

💰 Pris: ${bookingData.price} kr

${
  bookingData.isGuestBooking
    ? "👤 Dette var en gjestebooking"
    : "👤 Kunde har registrert konto"
}

⚠️ Husk å sjekke om kunden skal refunderes og oppdater kalenderen din.

---
Dette er en automatisk melding fra Knipetak booking-systemet.
Du kan svare direkte på denne e-posten for å kontakte kunden.`;
  }

  /**
   * Updates the email configuration (useful for when you set up Helene's own EmailJS later)
   */
  updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("📧 Email notification config updated:", this.config);
  }
}

// Export a singleton instance
export const emailNotificationService = new EmailNotificationService();
