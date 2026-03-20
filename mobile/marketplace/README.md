# CRMSoft Marketplace — Flutter Mobile App

LinkedIn + Instagram hybrid social commerce platform for B2B marketplace.

## Architecture

- **State management**: Riverpod 2.x with code generation
- **Navigation**: GoRouter with ShellRoute for bottom nav
- **HTTP**: Dio with auth + tenant interceptors
- **Storage**: FlutterSecureStorage for JWT tokens

## Screens

| Screen | Route | Status |
|---|---|---|
| Feed | `/feed` | Scaffolded |
| Discover | `/discover` | Scaffolded |
| Offers | `/offers` | Scaffolded |
| Profile | `/profile` | Scaffolded |
| Product Detail | `/listing/:id` | Scaffolded |
| Offer Detail | `/offer/:id` | Scaffolded |
| Create Post | `/create` | Scaffolded |
| Enquiries | `/enquiries` | Scaffolded |
| Notifications | `/notifications` | Scaffolded |

## Getting Started

1. Copy `.env.example` to `.env` and fill in values
2. Run `flutter pub get`
3. Run `flutter run`

## Backend Connection

All API calls go to `API_BASE_URL` defined in `.env`.
The backend is at `/Users/kmrjyoti/MyFile/Working/CRM-SOFT/API`.
