# Contract: Contact Submission Handling

## Purpose
Define validation, anti-spam, storage, and notification requirements for the contact form.

## Functional Requirements Mapping
- FR-020 (Contact Form)
- FR-021 (Spam Mitigation)
- FR-022 (Retention 12 months)

## Data Shape
```json
{
  "name": "string (1..120)",
  "email": "string (valid RFC 5322, <=254)",
  "message": "string (1..5000)",
  "submittedAt": "ISO8601 UTC",
  "ipHash": "sha256(ip + secretSalt)",
  "honeypot": "string | undefined"
}
```

## Validation Rules
| ID | Rule | Failure Response |
|----|------|------------------|
| CT-001 | name required length 1..120 | 400 invalid_name |
| CT-002 | email format + length <=254 | 400 invalid_email |
| CT-003 | message length 1..5000 | 400 invalid_message |
| CT-004 | honeypot must be empty | 200 generic success (silent discard) |
| CT-005 | rate limit 3/hour/ipHash | 429 rate_limited |
| CT-006 | user-agent required | 400 missing_user_agent |
| CT-007 | Content must not contain >70% identical repeated characters sequences | 400 spam_pattern |

## Processing Flow
1. Receive JSON POST.
2. Normalize & trim fields.
3. Apply validation and spam checks.
4. If honeypot filled -> log (level info) & return generic success without storing.
5. If passes: store record (append-only) with generated id.
6. Fire notification hook (future optional) asynchronously.
7. Return 202 accepted with generic success message; never echo raw submission to mitigate enumeration.

## Storage
- Static site constraint: Use GitHub Issues or external serverless endpoint (future). Phase 1 contract assumes pluggable adapter interface:
  Interface: `submitContact(data) -> Promise<void>`
  Adapters considered: (a) GitHub REST create issue, (b) Form backend service.

## Retention
- A scheduled external job (documented) must purge entries older than 365 days.

## Security & Privacy
- `ipHash` only; no raw IP stored.
- Salt stored in repository secret; never committed.
- Emails not exposed in client logs.

## Non-Functional
- End-to-end (client validation -> adapter) under 800ms p95 (excluding external network variability >300ms).
- Graceful degradation: if adapter fails, respond 202 and queue retry (future scope). Phase 1: just fail 500.

## Test Cases
| Case | Description | Expect |
|------|-------------|--------|
| valid-basic | Typical submission | 202 accepted |
| honey-filled | Honeypot tripped | 200 success (not stored) |
| rate-limit | 4th submission in hour | 429 |
| long-message | 5001 chars | 400 invalid_message |
| spam-pattern | 80% same char | 400 spam_pattern |
| malformed-email | invalid format | 400 invalid_email |

