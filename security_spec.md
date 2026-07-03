# Security Specification for Resen Legal

## Data Invariants
1. Services, Team Members, and Blog Posts are **Read-Only** for public users.
2. Contact messages can be **Created** by anyone but are not readable by the public.
3. Only authenticated Admins (if any) can modify content. For this public demo, we assume the content is managed via a dedicated dashboard.

## The Dirty Dozen Payloads (Targeting Firestore Rules)

1. **Identity Spoofing**: Attempt to create a service document with a custom `ownerId`.
2. **resource Poisoning**: Attempt to create a document with a 2MB string in a field.
3. **State Shortcutting**: Attempt to skip a status check if one existed.
4. **Unauthenticated Write**: Attempt to delete a service as an anonymous user.
5. **Unauthorized Read**: Attempt to read the `contactMessages` collection as a guest.
6. **Cross-User Leak**: Attempt to read another user's private message (if they were private).
7. **Malicious ID**: Use `../../system/root` as a document ID.
8. **Field Injection**: Add a `verified: true` field to a team member document.
9. **Bulk Export Denial**: Attempt a `list` query on `contactMessages` without any filters.
10. **Timestamp Fraud**: Prviding a `createdAt` date from the future.
11. **Type Mismatch**: Sending a Number into the `title` object field.
12. **Array Exhaustion**: Sending an array with 10,000 elements.

## Test Runner Plan
We will implement rules that deny these by default.
