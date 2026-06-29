# Agent.md

This file gives coding agents and AI assistants operational guidance for the Jirani Mwema SHG Finance Portal.

## Project Summary

This is a Next.js 16 TypeScript application for managing a self-help group's finance operations.

The app includes:

- Firebase Authentication
- Firestore role-based data access
- Admin approval workflow
- Member records
- Monthly contributions
- Arrears tracking
- Payment verification
- Insurance policies
- Merry-go-round schedule
- Bereaved family support cases
- Defaulter notifications
- Charts and analytics
- CSV exports
- Audit logs
- Public landing page
- Admin and Member login flows

## Working Directory

Primary local path:

```txt
C:\Users\Public\jirani-finance-app
```

Use PowerShell commands unless instructed otherwise.

## Core Files

```txt
src/app/page.tsx
src/app/layout.tsx
src/app/landing/page.tsx
src/app/globals.css
firestore.rules
package.json
package-lock.json
.gitignore
```

## Stack

- Next.js 16
- React
- TypeScript / TSX
- Tailwind CSS
- Firebase Auth
- Firestore
- Framer Motion
- Lucide React
- Recharts
- Vercel

## Do Not Do

Do not run `create-next-app` inside this project. The app already exists.

Do not remove existing Firebase configuration unless explicitly requested.

Do not replace TypeScript React files with markdown instructions. If writing app code, output valid `.tsx`.

Do not expose private keys. Firebase web config is allowed in the frontend, but secret service keys must never be committed.

Do not weaken Firestore rules to `allow read, write: if true`.

Do not make normal Members able to access:

- Role Management
- Access Requests
- Member Search personal data
- Defaulter Notifications
- Audit Logs
- Data Health private checks

## Required Commands

Install dependencies:

```powershell
npm install
```

Required UI dependencies:

```powershell
npm install framer-motion lucide-react recharts
```

Run dev server:

```powershell
npm run dev
```

Build:

```powershell
npm run build
```

Deploy Firestore rules:

```powershell
firebase deploy --only firestore:rules --project studio-7602007172-1035f
```

Deploy app:

```powershell
vercel --prod
```

## Firebase Project

```txt
projectId: studio-7602007172-1035f
groupId: demo_group_01
bootstrap admin email: jiranimwema202420@gmail.com
```

## Role Rules

The app uses these user roles:

```txt
Admin
Treasurer
Chairperson
Member
Guest
```

General permissions:

```txt
Admin:
- Full management access
- Role management
- Access request approval
- Member creation/update/delete
- Finance tools
- Audit logs

Treasurer:
- Finance workflows
- Contributions
- Verification
- Defaulter notifications
- Reports
- Member search personal data where allowed

Chairperson:
- Group visibility
- Limited management depending on future requirements

Member:
- Approved member access only
- No admin-only tools

Guest:
- Can submit access request only
```

## Firestore Paths

Use these collection paths consistently:

```txt
groups/demo_group_01/members
groups/demo_group_01/contributions
groups/demo_group_01/rounds
groups/demo_group_01/insurance
groups/demo_group_01/bereavedCases
groups/demo_group_01/auditLogs
groups/demo_group_01/accessRequests
groups/demo_group_01/memberships
memberships
```

Membership docs are written to both:

```txt
groups/demo_group_01/memberships/{uid}
memberships/membership_{uid}
```

This is intentional. Do not remove one without refactoring the role resolver and rules.

## Admin Approval Workflow

When Admin approves a user request, the app must:

1. Confirm request is `Pending`.
2. Resolve selected approval role.
3. Write group membership:
   ```txt
   groups/demo_group_01/memberships/{uid}
   ```
4. Write global membership:
   ```txt
   memberships/membership_{uid}
   ```
5. Create or update member finance record:
   ```txt
   groups/demo_group_01/members/{memberId}
   ```
6. Update access request:
   ```txt
   groups/demo_group_01/accessRequests/{uid}
   ```
7. Write audit log:
   ```txt
   groups/demo_group_01/auditLogs/{logId}
   ```

The member finance record is required so approved users appear in:

- Members
- Monthly contribution generation
- Arrears tracking
- Member statements
- Defaulter notifications

## Auth / Login

The app has:

```txt
Member Sign In
Admin Login
```

Admin Login must verify the resolved role after Google sign-in. If not Admin, it should sign the user out and show a denial message.

## Landing Page

Routes:

```txt
/
```

Shows public landing page only when signed out. If signed in, it routes/render-checks into the user workspace.

```txt
/landing
```

Standalone public landing route for previewing the frosty glassmorphism landing page even when signed in.

## UI Guidelines

Maintain:

- Mobile-first layout
- Frosted glassmorphism style
- Clear role-based visibility
- Accessible buttons
- Large tap targets
- Responsive cards for mobile
- Tables only where necessary
- Stacked mobile cards for narrow screens

Use:

- Framer Motion for entry/hover/tap animations
- Lucide React for icons
- Recharts for charts

## Error Handling

The app should surface:

- Firestore permission errors
- Data load failures
- Missing member data
- Duplicate member names
- Missing payment dates
- Invalid amounts
- Arrears
- Unverified/rejected payments
- Missing contacts for notifications

Keep the Data Health & Errors module functional.

## Build Safety

Before marking work complete, run:

```powershell
npm run build
```

If TypeScript fails, fix the actual file. Do not tell the user to ignore build errors.

## Git Safety

Before commit:

```powershell
git status
```

Commit relevant files only.

Common final commit:

```powershell
git add .\src\app\page.tsx .\src\app\landing\page.tsx .\src\app\layout.tsx .\package.json .\package-lock.json .\firestore.rules .\.gitignore
git commit -m "Prepare production deployment"
git push
```

## Common User Environment

The user uses Windows PowerShell and VS Code.

Avoid Linux/macOS commands unless specifically requested.

Use exact Windows paths:

```txt
C:\Users\Public\jirani-finance-app
C:\Users\HP\Downloads
```

## Common Issues

### `next` is not recognized

Run:

```powershell
npm install
npm run build
```

### `npm rub build`

Typo. Correct command:

```powershell
npm run build
```

### Hydration mismatch with `cz-shortcut-listen`

Usually caused by a browser extension. The layout can use:

```tsx
suppressHydrationWarning
```

on `<html>` and `<body>`.

### Firebase Missing Permissions

Usually Firestore rules. Check denied path in browser console. Deploy latest rules:

```powershell
firebase deploy --only firestore:rules --project studio-7602007172-1035f
```

### Admin Login not appearing

Check:

```powershell
Select-String -Path ".\src\app\page.tsx" -Pattern "Admin Login"
```

If not found, latest page was not copied.

## Deployment Checklist for Agents

Before advising deployment, verify:

```txt
- npm install completed
- npm run build passes
- firestore.rules deployed
- Admin Login visible
- Member Sign In visible
- /landing route exists
- Admin approval flow links member finance record
- Vercel production domain is added to Firebase Auth authorized domains
- Git working tree is clean or changes are committed
```

## Future Improvements

Recommended next enhancements:

1. Split private member data into `memberPrivateData`.
2. Add Cloud Functions for SMS/WhatsApp notifications.
3. Add notification history collection.
4. Add backup/export all data feature.
5. Add system health page.
6. Add automated tests for role visibility.
7. Add offline-friendly member statement export.
8. Add Firebase App Check.
9. Add per-action permission tests.
10. Add production error reporting.
