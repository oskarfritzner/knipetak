import emailjs from "@emailjs/browser";

// Simple debug test function
export const debugEmailTest = async () => {
  console.log("🔍 Testing minimal EmailJS configuration...");
  const serviceId = "service_sstnsjr";
  const templateId = "template_t3u03cl";
  const publicKey = "QbsqRNA19P8VBkMBZ";
  console.log("Using:", { serviceId, templateId, publicKey });

  try {
    const result = await emailjs.send(
      serviceId,
      templateId, // Correct template ID
      {
        email: "test@test.com",
        message: "Simple test message",
        name: "Test User",
      },
      publicKey
    );

    console.log("✅ Minimal test SUCCESS:", result);
    return true;
  } catch (error) {
    console.error("❌ Minimal test FAILED:", error);
    return false;
  }
};

// Make available globally
window.debugEmailTest = debugEmailTest;
