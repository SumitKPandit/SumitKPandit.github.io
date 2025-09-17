import { defineEventHandler, createError, readBody, getHeader, setHeader } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs';
import { z } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/zod@4.1.9/node_modules/zod/index.js';
import { createHash } from 'node:crypto';

function hashIpAddress(ip, salt) {
  const hashSalt = process.env.CONTACT_SALT || "dev-salt-change-in-production";
  const hash = createHash("sha256");
  hash.update(ip + hashSalt);
  return hash.digest("hex").substring(0, 16);
}
function isValidIpAddress(ip) {
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}
function extractClientIp(headers) {
  const ipHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip",
    // Cloudflare
    "x-cluster-client-ip",
    "true-client-ip"
  ];
  for (const header of ipHeaders) {
    const value = headers[header];
    if (value) {
      const ip = Array.isArray(value) ? value[0] : value.split(",")[0];
      const trimmedIp = ip.trim();
      if (isValidIpAddress(trimmedIp)) {
        return trimmedIp;
      }
    }
  }
  return null;
}
const RATE_LIMIT_WINDOWS = {
  HOUR: 60 * 60 * 1e3};
function cleanExpiredTimestamps(timestamps, windowMs) {
  const now = Date.now();
  return timestamps.filter((timestamp) => now - timestamp < windowMs);
}
function checkRateLimit$1(timestamps, maxActions, windowMs) {
  const recentTimestamps = cleanExpiredTimestamps(timestamps, windowMs);
  const remaining = Math.max(0, maxActions - recentTimestamps.length);
  const allowed = recentTimestamps.length < maxActions;
  const resetTime = new Date(Date.now() + windowMs);
  return { allowed, remaining, resetTime };
}

const ContactSubmissionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  subject: z.string().max(200, "Subject too long").optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5e3, "Message too long"),
  persona: z.string().optional(),
  // Which persona they're contacting
  honeypot: z.string().max(0, "Bot detected").optional(),
  // Anti-spam honeypot field
  timestamp: z.string().optional(),
  userAgent: z.string().optional()
});
const rateLimitStore = /* @__PURE__ */ new Map();
const RATE_LIMIT_WINDOW = RATE_LIMIT_WINDOWS.HOUR;
const MAX_SUBMISSIONS_PER_HOUR = 3;
function checkRateLimit(ipHash) {
  const submissions = rateLimitStore.get(ipHash) || [];
  const result = checkRateLimit$1(submissions, MAX_SUBMISSIONS_PER_HOUR, RATE_LIMIT_WINDOW);
  const recentSubmissions = submissions.filter((timestamp) => Date.now() - timestamp < RATE_LIMIT_WINDOW);
  if (recentSubmissions.length > 0) {
    rateLimitStore.set(ipHash, recentSubmissions);
  } else {
    rateLimitStore.delete(ipHash);
  }
  return result;
}
function recordSubmission(ipHash) {
  const now = Date.now();
  const submissions = rateLimitStore.get(ipHash) || [];
  submissions.push(now);
  rateLimitStore.set(ipHash, submissions);
}
function sanitizeMessage(message) {
  return message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/\s*on\w+\s*=\s*"[^"]*"/gi, "").replace(/\s*on\w+\s*=\s*'[^']*'/gi, "").replace(/javascript:/gi, "").trim();
}
async function processContactSubmission(submission) {
  try {
    const { getContactAdapter } = await import('../../_/contactAdapter.mjs');
    const adapter = getContactAdapter();
    const result = await adapter.submitContact(submission);
    return {
      success: result.success,
      message: result.message,
      submissionId: result.submissionId
    };
  } catch (error) {
    console.error("Contact submission error:", error);
    return {
      success: false,
      message: "Sorry, there was an error sending your message. Please try again."
    };
  }
}
const contact_post = defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed"
    });
  }
  try {
    const body = await readBody(event);
    const clientIP = extractClientIp(event.node.req.headers) || event.node.req.socket.remoteAddress || "unknown";
    const ipHash = hashIpAddress(clientIP);
    const rateLimit = checkRateLimit(ipHash);
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: "Too Many Requests",
        data: {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: RATE_LIMIT_WINDOW / 1e3
          // seconds
        }
      });
    }
    const submissionWithMeta = {
      ...body,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userAgent: getHeader(event, "user-agent") || "Unknown",
      ipHash
      // Store hashed IP, not raw IP
    };
    const validation = ContactSubmissionSchema.safeParse(submissionWithMeta);
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Validation Error",
        data: {
          error: "Invalid form data",
          details: validation.error.issues.map((issue) => ({
            field: issue.path.join(".") || "root",
            message: issue.message
          }))
        }
      });
    }
    const validatedSubmission = validation.data;
    if (validatedSubmission.honeypot && validatedSubmission.honeypot.length > 0) {
      console.warn("\u{1F6AB} Honeypot triggered for IP:", ipHash);
      return {
        success: true,
        message: "Thank you for your message!",
        submissionId: `blocked-${Date.now()}`
      };
    }
    validatedSubmission.message = sanitizeMessage(validatedSubmission.message);
    recordSubmission(ipHash);
    const result = await processContactSubmission(validatedSubmission);
    setHeader(event, "X-RateLimit-Remaining", rateLimit.remaining.toString());
    setHeader(event, "X-RateLimit-Reset", new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString());
    return {
      success: result.success,
      message: result.message,
      submissionId: result.submissionId,
      rateLimitRemaining: rateLimit.remaining - 1
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Contact API error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: {
        error: "An unexpected error occurred. Please try again later."
      }
    });
  }
});

export { contact_post as default };
//# sourceMappingURL=contact.post.mjs.map
