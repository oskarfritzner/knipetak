import { emailNotificationService } from "../services/emailNotificationService";
import { BookingData } from "../backend/interfaces/BookingData";

/**
 * Test function to send sample booking notification emails
 * Call this from browser console to test email notifications
 */
export const testBookingNotifications = async () => {
  // Sample booking data for testing
  const sampleBookingData: BookingData = {
    bookingId: "test-booking-123",
    customerId: "test-customer-456",
    customerEmail: "test@example.com",
    customerName: "Test Kunde",
    customerPhone: "+47 123 45 678",
    date: new Date(2024, 11, 15), // December 15, 2024
    duration: 60,
    location: {
      address: "Testveien 123",
      city: "Bergen",
      postalCode: 5000,
    },
    paymentStatus: false,
    price: 1200,
    status: "pending",
    customerMessage: "Dette er en test booking melding fra kunden.",
    timeslot: {
      start: new Date(2024, 11, 15, 14, 0), // 14:00
      end: new Date(2024, 11, 15, 15, 0), // 15:00
    },
    treatmentId: "test-treatment-789",
    isGuestBooking: false,
  };

  console.log("🧪 Testing booking notification emails...");

  try {
    // Test new booking notification
    console.log("📧 Sending test NEW BOOKING notification...");
    await emailNotificationService.sendNewBookingNotification(
      sampleBookingData
    );
    console.log("✅ New booking notification test completed");

    // Wait a bit before sending cancellation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test cancelled booking notification
    console.log("📧 Sending test CANCELLED BOOKING notification...");
    const cancelledBookingData = {
      ...sampleBookingData,
      status: "cancelled" as const,
    };
    await emailNotificationService.sendCancelledBookingNotification(
      cancelledBookingData
    );
    console.log("✅ Cancelled booking notification test completed");

    console.log(
      "🎉 All email notification tests completed! Check Helene@knipetak.no for emails."
    );
  } catch (error) {
    console.error("❌ Error testing email notifications:", error);
  }
};

/**
 * Test only new booking notification
 */
export const testNewBookingNotification = async () => {
  const sampleBookingData: BookingData = {
    bookingId: "test-new-booking-123",
    customerId: "test-customer-456",
    customerEmail: "kunde@example.com",
    customerName: "Test Ny Kunde",
    customerPhone: "+47 987 65 432",
    date: new Date(2024, 11, 20), // December 20, 2024
    duration: 90,
    location: {
      address: "Ny Testveien 456",
      city: "Oslo",
      postalCode: 1234,
    },
    paymentStatus: true,
    price: 1500,
    status: "confirmed",
    customerMessage: "Gleder meg til behandlingen!",
    timeslot: {
      start: new Date(2024, 11, 20, 10, 0), // 10:00
      end: new Date(2024, 11, 20, 11, 30), // 11:30
    },
    treatmentId: "test-treatment-abc",
    isGuestBooking: true,
  };

  console.log("🧪 Testing NEW booking notification...");
  try {
    await emailNotificationService.sendNewBookingNotification(
      sampleBookingData
    );
    console.log("✅ New booking notification test completed!");
  } catch (error) {
    console.error("❌ Error testing new booking notification:", error);
  }
};

/**
 * Test only cancelled booking notification
 */
export const testCancelledBookingNotification = async () => {
  const sampleBookingData: BookingData = {
    bookingId: "test-cancelled-booking-789",
    customerId: "test-customer-999",
    customerEmail: "kansellert@example.com",
    customerName: "Test Kansellert Kunde",
    customerPhone: "+47 555 44 333",
    date: new Date(2024, 11, 25), // December 25, 2024
    duration: 120,
    location: {
      address: "Kansellert Gate 789",
      city: "Stavanger",
      postalCode: 4000,
    },
    paymentStatus: true,
    price: 2000,
    status: "cancelled",
    customerMessage: "Må dessverre kansellere på grunn av sykdom.",
    timeslot: {
      start: new Date(2024, 11, 25, 16, 0), // 16:00
      end: new Date(2024, 11, 25, 18, 0), // 18:00
    },
    treatmentId: "test-treatment-xyz",
    isGuestBooking: false,
  };

  console.log("🧪 Testing CANCELLED booking notification...");
  try {
    await emailNotificationService.sendCancelledBookingNotification(
      sampleBookingData
    );
    console.log("✅ Cancelled booking notification test completed!");
  } catch (error) {
    console.error("❌ Error testing cancelled booking notification:", error);
  }
};

// Make functions available globally for browser console testing
(window as any).testBookingNotifications = testBookingNotifications;
(window as any).testNewBookingNotification = testNewBookingNotification;
(window as any).testCancelledBookingNotification =
  testCancelledBookingNotification;
