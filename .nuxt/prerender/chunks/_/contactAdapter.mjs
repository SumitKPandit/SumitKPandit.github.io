function getContactAdapter() {
  const adapterType = process.env.CONTACT_ADAPTER || "log";
  switch (adapterType) {
    case "log":
    default:
      return new LogContactAdapter();
  }
}
class LogContactAdapter {
  async submitContact(submission) {
    var _a;
    try {
      console.log("\u{1F4E7} Contact Form Submission Received:");
      console.log("\u2500".repeat(50));
      console.log(`\u{1F464} Name: ${submission.name}`);
      console.log(`\u{1F4E7} Email: ${submission.email}`);
      console.log(`\u{1F4CB} Subject: ${submission.subject || "(No subject)"}`);
      console.log(`\u{1F464} Persona: ${submission.persona || "general"}`);
      console.log(`\u23F0 Timestamp: ${submission.timestamp}`);
      console.log(`\u{1F5A5}\uFE0F  User Agent: ${((_a = submission.userAgent) == null ? void 0 : _a.substring(0, 50)) || "Unknown"}...`);
      console.log(`\u{1F512} IP Hash: ${submission.ipHash || "Not provided"}`);
      console.log("\u{1F4AC} Message:");
      console.log(submission.message);
      console.log("\u2500".repeat(50));
      console.log("\u2705 Contact submission logged successfully");
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        success: true,
        message: "Thank you for your message! I'll get back to you soon.",
        submissionId: `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      };
    } catch (error) {
      console.error("\u274C Error in LogContactAdapter:", error);
      return {
        success: false,
        message: "An error occurred while processing your message.",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  getAdapterInfo() {
    return {
      name: "LogContactAdapter",
      version: "1.0.0",
      description: "Development adapter that logs contact submissions to console"
    };
  }
}

export { LogContactAdapter, getContactAdapter };
//# sourceMappingURL=contactAdapter.mjs.map
