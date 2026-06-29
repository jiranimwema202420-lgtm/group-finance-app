# Jirani Mwema SHG Finance Portal

Jirani Mwema SHG Finance Portal is a mobile-first finance management web application for a self-help group. It manages members, monthly remittances, welfare, merry-go-round contributions, insurance records, bereaved family support, arrears, admin approvals, role-based access, reports, charts, and defaulter notifications.

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript / TSX
- **UI:** React, Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts
- **Backend:** Firebase Authentication + Cloud Firestore
- **Deployment:** Vercel
- **Database Project:** `studio-7602007172-1035f`
- **Default Group ID:** `demo_group_01`

## Main Features

### Public / Auth

- Public frosty glassmorphism landing page
- Separate **Member Sign In**
- Separate **Admin Login**
- Google Firebase Authentication
- Guest access request workflow
- Admin approval/rejection workflow

### Roles

Supported roles:

- `Admin`
- `Treasurer`
- `Chairperson`
- `Member`
- `Guest`

Role-based access is enforced in the frontend and should also be enforced by Firestore security rules.

### Admin Features

- Access request approval/rejection
- Role management
- Member management
- Protected member search/personal data
- Data health and error handling
- Audit logs
- Admin-only workflow controls

### Treasurer / Finance Features

- Monthly contribution management
- Payment verification
- Arrears tracking
- Member statements
- Defaulter notifications
- CSV exports
- Charts and analytics

### Member Features

- Member access after approval
- Personal contribution visibility
- Group data access based on Firestore rules

## Important Firestore Paths

```txt
groups/demo_group_01/members/{memberId}
groups/demo_group_01/contributions/{contributionId}
groups/demo_group_01/rounds/{roundId}
groups/demo_group_01/insurance/{policyId}
groups/demo_group_01/bereavedCases/{caseId}
groups/demo_group_01/auditLogs/{logId}
groups/demo_group_01/accessRequests/{uid}
groups/demo_group_01/memberships/{uid}
memberships/membership_{uid}
```

Optional future private member data path:

```txt
groups/demo_group_01/memberPrivateData/{memberId}
```

Use this path later for sensitive member information such as phone numbers, emails, private notes, family details, or other restricted data. Only Admin/Treasurer should be allowed to read it.

## Local Development

Open PowerShell:

```powershell
cd "C:\Users\Public\jirani-finance-app"
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
http://localhost:3000/landing
```

## Build

```powershell
npm run build
```

Do not deploy until the build passes.

## Required Dependencies

```powershell
npm install framer-motion lucide-react recharts
```

## Firebase Rules Deployment

Deploy Firestore rules before deploying the app:

```powershell
firebase deploy --only firestore:rules --project studio-7602007172-1035f
```

## Vercel Deployment

Deploy production:

```powershell
vercel --prod
```

After deployment, add the Vercel domain to Firebase Authentication authorized domains:

```txt
Firebase Console
Authentication
Settings
Authorized domains
Add domain
```

Example:

```txt
jirani-finance-app.vercel.app
```

## Production Checklist

Before deployment, confirm:

```txt
- npm run build passes
- Firestore rules are deployed
- Admin Login is visible
- Member Sign In works
- Admin approval creates/updates both:
  - membership records
  - member finance records
- Treasurer/Admin can access defaulter notifications
- Normal Member cannot access admin-only tools
- /landing route works
- Firebase authorized domain includes the Vercel domain
- Git working tree is clean
```

## Git Workflow

Check status:

```powershell
git status
```

Stage important files:

```powershell
git add .\src\app\page.tsx .\src\app\landing\page.tsx .\src\app\layout.tsx .\package.json .\package-lock.json .\firestore.rules .\.gitignore
```

Commit:

```powershell
git commit -m "Prepare production deployment"
```

Push:

```powershell
git push
```

## Useful Verification Commands

Check if Admin Login exists in main page:

```powershell
Select-String -Path ".\src\app\page.tsx" -Pattern "Admin Login"
```

Check landing route:

```powershell
Select-String -Path ".\src\app\landing\page.tsx" -Pattern "Admin Login"
```

Run production build:

```powershell
npm run build
```

## Current Security Notes

The frontend hides restricted tools for non-admin users, but final production security must always rely on Firestore rules.

Recommended future hardening:

```txt
1. Move sensitive member fields to memberPrivateData.
2. Allow only Admin/Treasurer to read private data.
3. Keep public member records minimal.
4. Use Cloud Functions later for bulk notifications.
5. Add automated audit-log review for sensitive actions.
```

## Project Owner

- Name: Nduati Njoroge
- Email: jiranimwema202420@gmail.com
