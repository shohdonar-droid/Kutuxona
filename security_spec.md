# Security Specification - TDTU Chirchiq Library

## Data Invariants
1. A `Loan` must reference a valid `studentId` and a valid `copyId`.
2. A `BookCopy` must reference a valid `bookId`.
3. A `Reservation` must reference a valid `userId` and `bookId`.
4. User roles (`admin`, `librarian`, `tutor`, `student`) are immutable once set by an admin.
5. `createdAt` timestamps are immutable and must match server time.
6. `email_verified` must be true for all non-public write operations.

## The "Dirty Dozen" Payloads

1. **Self-Promotion**: User attempts to update their own role to 'admin'.
2. **Ghost Book**: Creating a book with a 1MB annotation to exhaust storage.
3. **Orphaned Copy**: Creating a `BookCopy` for a `bookId` that doesn't exist.
4. **Illegal Loan**: Student attempts to create a `Loan` record for themselves directly.
5. **Timestamp Spoofing**: Setting a `createdAt` date in the past.
6. **Role Hijacking**: Non-admin user attempts to create a new user profile with 'librarian' role.
7. **PII Leak**: Non-owner user attempts to 'get' a user document to read their email/phone.
8. **Resource Poisoning**: Creating a document with a 2KB junk string as the document ID.
9. **Update Gap**: Updating a `Loan` status to 'RETURNED' without setting `returnedAt`.
10. **Unverified Write**: Attempting to create a reservation with an unverified email account.
11. **Query Scraping**: Authenticated student attempts to list all loans in the system without filters.
12. **Status Shortcutting**: Attempting to update a reservation from 'PENDING' to 'FULFILLED' bypassing 'READY'.

## Test Runner (Draft)
A comprehensive `firestore.rules.test.ts` will be implemented to verify all deny conditions.
