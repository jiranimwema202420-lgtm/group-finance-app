'use client';

import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAoaJmF72UdLDd7kKfdvRMH_j_NFL8KZj8',
  authDomain: 'studio-7602007172-1035f.firebaseapp.com',
  projectId: 'studio-7602007172-1035f',
  storageBucket: 'studio-7602007172-1035f.firebasestorage.app',
  messagingSenderId: '605000372115',
  appId: '1:605000372115:web:1b6ee36d456841d598e266',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const CURRENT_GROUP_ID = 'demo_group_01';
const ADMIN_EMAILS = ['jiranimwema202420@gmail.com'];

const tableScrollbarCss = `
  .visible-horizontal-scrollbar {
    display: block;
    width: 100%;
    max-width: 100%;
    overflow-x: auto !important;
    overflow-y: hidden;
    scrollbar-width: auto;
    scrollbar-color: rgba(34, 211, 238, 0.95) rgba(15, 23, 42, 0.85);
    scrollbar-gutter: stable both-edges;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x;
  }

  .visible-horizontal-scrollbar table {
    width: max-content;
    min-width: max-content;
  }

  .visible-horizontal-scrollbar::-webkit-scrollbar {
    height: 14px;
  }

  .visible-horizontal-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.9);
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .visible-horizontal-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, rgba(34, 211, 238, 0.95), rgba(99, 102, 241, 0.95));
    border-radius: 999px;
    border: 2px solid rgba(15, 23, 42, 0.9);
  }

  .visible-horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, rgba(103, 232, 249, 1), rgba(129, 140, 248, 1));
  }

  .table-scroll-hint {
    pointer-events: none;
    position: sticky;
    left: 0;
    display: inline-flex;
    margin-bottom: 0.5rem;
    border-radius: 999px;
    border: 1px solid rgba(34, 211, 238, 0.24);
    background: rgba(8, 47, 73, 0.7);
    padding: 0.25rem 0.65rem;
    color: rgb(207, 250, 254);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    backdrop-filter: blur(14px);
  }


  .premium-surface {
    position: relative;
    isolation: isolate;
  }

  .premium-surface::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.035) 34%, rgba(34,211,238,0.08)),
      radial-gradient(circle at 15% 0%, rgba(34,211,238,0.16), transparent 32%),
      radial-gradient(circle at 90% 10%, rgba(99,102,241,0.16), transparent 34%);
    opacity: 0.82;
    z-index: -1;
  }

  .soft-grid-bg {
    background-image:
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: linear-gradient(to bottom, black 0%, transparent 80%);
  }

  .touch-card {
    transform: translateZ(0);
  }

  .touch-card:active {
    transform: scale(0.99);
  }

  .metric-glow {
    box-shadow:
      0 22px 70px rgba(0,0,0,0.28),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .subtle-divider {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  }

  html {
    scroll-behavior: smooth;
  }

  button,
  a,
  input,
  select,
  textarea {
    -webkit-tap-highlight-color: transparent;
  }

  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 3px solid rgba(34, 211, 238, 0.6);
    outline-offset: 3px;
  }


  .theme-light {
    color-scheme: light;
    background:
      radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 34%),
      radial-gradient(circle at 85% 10%, rgba(99, 102, 241, 0.12), transparent 35%),
      radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.10), transparent 38%),
      linear-gradient(135deg, #f8fafc, #eef6ff 48%, #f8fafc) !important;
    color: rgb(15, 23, 42) !important;
  }

  .theme-dark {
    color-scheme: dark;
  }

  .theme-light .premium-surface::before {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.55) 36%, rgba(14,165,233,0.08)),
      radial-gradient(circle at 15% 0%, rgba(14,165,233,0.12), transparent 32%),
      radial-gradient(circle at 90% 10%, rgba(99,102,241,0.10), transparent 34%);
    opacity: 1;
  }

  .theme-light .soft-grid-bg {
    background-image:
      linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px);
  }

  .theme-light [class*="bg-slate-950"],
  .theme-light [class*="bg-black"],
  .theme-light [class*="bg-white/"] {
    background-color: rgba(255, 255, 255, 0.72) !important;
  }

  .theme-light [class*="border-white"] {
    border-color: rgba(15, 23, 42, 0.12) !important;
  }

  .theme-light .text-white,
  .theme-light .text-slate-50,
  .theme-light .text-slate-100,
  .theme-light .text-slate-200 {
    color: rgb(15, 23, 42) !important;
  }

  .theme-light .text-slate-300,
  .theme-light .text-slate-400,
  .theme-light .text-slate-500 {
    color: rgb(71, 85, 105) !important;
  }

  .theme-light input,
  .theme-light select,
  .theme-light textarea {
    background-color: rgba(255, 255, 255, 0.9) !important;
    color: rgb(15, 23, 42) !important;
    border-color: rgba(15, 23, 42, 0.14) !important;
  }

  .theme-light input::placeholder,
  .theme-light textarea::placeholder {
    color: rgb(100, 116, 139) !important;
  }

  .theme-light option {
    background: rgb(255, 255, 255) !important;
    color: rgb(15, 23, 42) !important;
  }

  .theme-light table thead {
    background-color: rgba(241, 245, 249, 0.8) !important;
  }

  .theme-light table tbody tr:hover {
    background-color: rgba(14, 165, 233, 0.08) !important;
  }

  .theme-light .visible-horizontal-scrollbar {
    scrollbar-color: rgba(14, 165, 233, 0.95) rgba(226, 232, 240, 0.95);
  }

  .theme-light .visible-horizontal-scrollbar::-webkit-scrollbar-track {
    background: rgba(226, 232, 240, 0.95);
    border-color: rgba(15, 23, 42, 0.1);
  }

  .theme-light .visible-horizontal-scrollbar::-webkit-scrollbar-thumb {
    border-color: rgba(226, 232, 240, 0.95);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

type PaymentStatus = 'Paid' | 'Pending';
type UserRole = 'Guest' | 'Member' | 'Chairperson' | 'Treasurer' | 'Admin';
type ProtectedRole = Exclude<UserRole, 'Guest'>;
type ManagedUserRole = Exclude<UserRole, 'Guest'>;
type MembershipStatus = 'active' | 'inactive' | 'disabled';
type AccessRequestStatus = 'Pending' | 'Approved' | 'Rejected';
type ToastTone = 'success' | 'error' | 'warning' | 'info';
type ThemeMode = 'dark' | 'light';
type VerificationStatus = 'Unverified' | 'Verified' | 'Rejected';
type RoundStatus = 'Completed' | 'Current' | 'Upcoming';
type InsuranceStatus = 'Active' | 'Pending' | 'Expired';
type BereavedStatus = 'Open' | 'Closed';

interface Member {
  id: string;
  name: string;
  email: string;
  contact: string;
  insurancePaid: number;
  status: PaymentStatus;
  joinDate: string;
}

interface MemberImportPreviewRow {
  rowNumber: number;
  name: string;
  email: string;
  contact: string;
  insurancePaid: number;
  status: PaymentStatus;
  joinDate: string;
  error?: string;
  duplicate?: boolean;
}

interface MonthlyContribution {
  id: string;
  memberName: string;
  month: string;
  welfare: number;
  merryGoRound: number;
  insurance: number;
  bereavedFamily: number;
  total: number;
  expectedAmount?: number;
  paidAmount?: number;
  balance?: number;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  verificationStatus?: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  amount?: number;
  createdAt?: string;
  updatedAt?: string;
}

type ContributionEditForm = {
  memberName: string;
  month: string;
  welfare: string;
  merryGoRound: string;
  insurance: string;
  bereavedFamily: string;
  paidAmount: string;
  paymentStatus: PaymentStatus;
  paymentDate: string;
};

interface MerryGoRoundRound {
  id: string;
  roundNumber: number;
  payoutDate: string;
  recipientName: string;
  payoutAmount: number;
  status: RoundStatus;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InsurancePolicy {
  id: string;
  providerName: string;
  policyNumber: string;
  month: string;
  policyStartDate: string;
  policyEndDate: string;
  premiumTarget: number;
  providerContribution: number;
  lastRespectBenefit: number;
  status: InsuranceStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface BereavedCase {
  id: string;
  memberName: string;
  familyContact: string;
  month: string;
  caseDate: string;
  targetAmount: number;
  collectedAmount: number;
  status: BereavedStatus;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuditLog {
  id: string;
  action: string;
  module: string;
  actor: string;
  actorUid?: string;
  actorEmail?: string;
  targetId?: string;
  targetName?: string;
  details: string;
  createdAt: string;
}

interface RoleMembership {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: ManagedUserRole;
  status: MembershipStatus;
  groupId: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface AccessRequest {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  reason: string;
  requestedRole: ManagedUserRole;
  approvedRole?: ManagedUserRole;
  status: AccessRequestStatus;
  groupId: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  detail: string;
}

interface ModuleProps {
  title: string;
  content: React.ReactNode;
}

interface ChartPanelProps {
  title: string;
  detail: string;
  children: React.ReactNode;
}

const roleRank: Record<UserRole, number> = {
  Guest: 0,
  Member: 1,
  Chairperson: 1.5,
  Treasurer: 2,
  Admin: 3,
};

const normalizeUserRole = (value: unknown): UserRole => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'admin' || normalized === 'administrator' || normalized === 'owner') return 'Admin';
  if (normalized === 'treasurer' || normalized === 'finance' || normalized === 'official') return 'Treasurer';
  if (normalized === 'chairperson' || normalized === 'chair' || normalized === 'chairman' || normalized === 'chairwoman') return 'Chairperson';
  if (normalized === 'member') return 'Member';

  return 'Member';
};

const resolveSignedInRole = async (firebaseUser: User): Promise<UserRole> => {
  const email = firebaseUser.email?.trim().toLowerCase() || '';

  if (ADMIN_EMAILS.includes(email)) return 'Admin';

  const possibleRoleDocs = [
    doc(db, 'memberships', `membership_${firebaseUser.uid}`),
    doc(db, 'groups', CURRENT_GROUP_ID, 'memberships', firebaseUser.uid),
  ];

  for (const roleDoc of possibleRoleDocs) {
    const snapshot = await getDoc(roleDoc);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const status = String(data.status || data.membershipStatus || 'active').trim().toLowerCase();

      if (status === 'disabled' || status === 'inactive' || status === 'suspended') return 'Guest';
      return normalizeUserRole(data.role || data.userRole || data.accessLevel);
    }
  }

  return 'Guest';
};


const managedRoleOptions: ManagedUserRole[] = ['Member', 'Chairperson', 'Treasurer', 'Admin'];
const membershipStatusOptions: MembershipStatus[] = ['active', 'inactive', 'disabled'];

const normalizeMembershipStatus = (value: unknown): MembershipStatus => {
  const normalized = String(value || 'active').trim().toLowerCase();

  if (normalized === 'inactive') return 'inactive';
  if (normalized === 'disabled' || normalized === 'suspended') return 'disabled';
  return 'active';
};

const normalizeManagedRole = (value: unknown): ManagedUserRole => {
  const role = normalizeUserRole(value);
  return role === 'Guest' ? 'Member' : role;
};

const normalizeAccessRequestStatus = (value: unknown): AccessRequestStatus => {
  const normalized = String(value || 'Pending').trim().toLowerCase();

  if (normalized === 'approved') return 'Approved';
  if (normalized === 'rejected' || normalized === 'declined') return 'Rejected';
  return 'Pending';
};

const buildAccessRequestFromData = (id: string, data: Record<string, unknown>): AccessRequest => ({
  id,
  uid: typeof data.uid === 'string' ? data.uid : id,
  email: typeof data.email === 'string' ? data.email : '',
  displayName: typeof data.displayName === 'string' ? data.displayName : '',
  phone: typeof data.phone === 'string' ? data.phone : '',
  reason: typeof data.reason === 'string' ? data.reason : '',
  requestedRole: normalizeManagedRole(data.requestedRole || data.role),
  approvedRole: data.approvedRole ? normalizeManagedRole(data.approvedRole) : undefined,
  status: normalizeAccessRequestStatus(data.status),
  groupId: typeof data.groupId === 'string' ? data.groupId : CURRENT_GROUP_ID,
  adminNotes: typeof data.adminNotes === 'string' ? data.adminNotes : '',
  createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
  updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  reviewedAt: typeof data.reviewedAt === 'string' ? data.reviewedAt : undefined,
  reviewedBy: typeof data.reviewedBy === 'string' ? data.reviewedBy : undefined,
});

const todayIso = () => new Date().toISOString().split('T')[0];
const oneYearFromTodayIso = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
};
const currentMonthName = () => new Date().toLocaleString('en-US', { month: 'long' });
const formatCalendarDate = (value?: string) => {
  if (!value) return 'Not set';

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toMoneyNumber = (value: unknown) => Number(value) || 0;

const parseDelimitedMemberLine = (line: string) => {
  const trimmedLine = line.trim();

  if (trimmedLine.includes('\t')) {
    return trimmedLine.split('\t').map((cell) => cell.trim());
  }

  const cells: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let index = 0; index < trimmedLine.length; index += 1) {
    const character = trimmedLine[index];

    if (character === '"') {
      const nextCharacter = trimmedLine[index + 1];

      if (insideQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === ',' && !insideQuotes) {
      cells.push(currentCell.trim());
      currentCell = '';
    } else {
      currentCell += character;
    }
  }

  cells.push(currentCell.trim());

  return cells;
};

const normalizeImportHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const normalizeMemberKey = (value: string) => value.trim().toLowerCase();

const normalizeImportedPaymentStatus = (value: string): PaymentStatus => {
  const normalizedValue = value.trim().toLowerCase();

  return normalizedValue === 'paid' || normalizedValue === 'yes' || normalizedValue === 'y' || normalizedValue === 'complete'
    ? 'Paid'
    : 'Pending';
};

const getContributionTotal = (contribution: MonthlyContribution) => {
  const splitTotal =
    toMoneyNumber(contribution.welfare) +
    toMoneyNumber(contribution.merryGoRound) +
    toMoneyNumber(contribution.insurance) +
    toMoneyNumber(contribution.bereavedFamily);

  return toMoneyNumber(contribution.total) || splitTotal || toMoneyNumber(contribution.amount);
};

const getContributionPaidAmount = (contribution: MonthlyContribution) => {
  const expectedAmount = getContributionTotal(contribution);
  const storedPaidAmount = toMoneyNumber(contribution.paidAmount);

  if (storedPaidAmount > 0) return Math.min(storedPaidAmount, expectedAmount);
  return contribution.paymentStatus === 'Paid' ? expectedAmount : 0;
};

const getContributionBalance = (contribution: MonthlyContribution) => {
  const expectedAmount = getContributionTotal(contribution);
  const paidAmount = getContributionPaidAmount(contribution);

  return Math.max(expectedAmount - paidAmount, 0);
};

const normalizeVerificationStatus = (value: unknown): VerificationStatus => {
  if (value === 'Verified' || value === 'Rejected') return value;
  return 'Unverified';
};

const contributionToEditForm = (contribution: MonthlyContribution): ContributionEditForm => ({
  memberName: contribution.memberName || '',
  month: contribution.month || currentMonthName(),
  welfare: String(toMoneyNumber(contribution.welfare)),
  merryGoRound: String(toMoneyNumber(contribution.merryGoRound)),
  insurance: String(toMoneyNumber(contribution.insurance)),
  bereavedFamily: String(toMoneyNumber(contribution.bereavedFamily)),
  paidAmount: String(getContributionPaidAmount(contribution)),
  paymentStatus: contribution.paymentStatus || 'Pending',
  paymentDate: contribution.paymentDate || todayIso(),
});

const emptyContributionEditForm = (): ContributionEditForm => ({
  memberName: '',
  month: currentMonthName(),
  welfare: '0',
  merryGoRound: '0',
  insurance: '0',
  bereavedFamily: '0',
  paidAmount: '0',
  paymentStatus: 'Pending',
  paymentDate: todayIso(),
});

const StatCard: React.FC<StatCardProps> = ({ title, value, detail }) => (
  <div className="premium-surface touch-card metric-glow group relative min-h-[136px] overflow-hidden rounded-[1.85rem] border border-white/10 bg-slate-950/35 p-4 ring-1 ring-white/5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.09] sm:p-5">
    <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl transition group-hover:bg-cyan-300/20" />
    <div className="absolute -bottom-16 left-4 h-28 w-28 rounded-full bg-indigo-400/10 blur-2xl" />
    <div className="relative flex h-full flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-300 sm:text-xs">{title}</p>
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/40" />
      </div>
      <p className="mt-4 break-words text-2xl font-black tracking-tight text-white sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-300">{detail}</p>
    </div>
  </div>
);

const Module: React.FC<ModuleProps> = ({ title, content }) => (
  <section id={title.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="mb-6 min-w-0 scroll-mt-28 sm:mb-8">
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1 sm:mb-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 shadow-lg shadow-cyan-950/20">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/40" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300/80">Workspace</p>
          <h2 className="truncate text-lg font-black tracking-tight text-white sm:text-xl">{title}</h2>
        </div>
      </div>
      <div className="hidden h-px flex-1 subtle-divider sm:block" />
    </div>
    <div className="premium-surface min-w-0 max-w-full overflow-hidden rounded-[1.85rem] border border-white/10 bg-slate-950/35 p-3 shadow-2xl shadow-black/25 ring-1 ring-white/5 backdrop-blur-2xl sm:p-5 lg:p-6">{content}</div>
  </section>
);

const ChartPanel: React.FC<ChartPanelProps> = ({ title, detail, children }) => (
  <div className="rounded-[1.65rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/15 ring-1 ring-white/5">
    <div className="mb-4">
      <p className="text-sm font-black tracking-tight text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
    <div className="h-[280px] w-full min-w-0">{children}</div>
  </div>
);

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [merryGoRound, setMerryGoRound] = useState<MerryGoRoundRound[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [bereavedCases, setBereavedCases] = useState<BereavedCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [roleMemberships, setRoleMemberships] = useState<RoleMembership[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [roleStatusFilter, setRoleStatusFilter] = useState<'All' | MembershipStatus>('All');
  const [accessRequestSearch, setAccessRequestSearch] = useState('');
  const [accessRequestStatusFilter, setAccessRequestStatusFilter] = useState<'All' | AccessRequestStatus>('All');
  const [accessApprovalRoles, setAccessApprovalRoles] = useState<Record<string, ManagedUserRole>>({});
  const [auditModuleFilter, setAuditModuleFilter] = useState('All');
  const [auditSearch, setAuditSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Guest');
  const [toast, setToast] = useState<{ id: number; message: string; tone: ToastTone } | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  const [editingContributionId, setEditingContributionId] = useState<string | null>(null);
  const [contributionEditForm, setContributionEditForm] = useState<ContributionEditForm>(emptyContributionEditForm());
  const [contributionMemberSearch, setContributionMemberSearch] = useState('');
  const [contributionMonthFilter, setContributionMonthFilter] = useState('All');
  const [contributionStatusFilter, setContributionStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [contributionVerificationFilter, setContributionVerificationFilter] = useState<'All' | VerificationStatus>('All');
  const [statementMemberName, setStatementMemberName] = useState('');
  const [generationMonth, setGenerationMonth] = useState(currentMonthName());

  const [submittingMember, setSubmittingMember] = useState(false);
  const [submittingContribution, setSubmittingContribution] = useState(false);
  const [generatingMonthlyRows, setGeneratingMonthlyRows] = useState(false);
  const [submittingRound, setSubmittingRound] = useState(false);
  const [submittingInsurance, setSubmittingInsurance] = useState(false);
  const [submittingBereavedCase, setSubmittingBereavedCase] = useState(false);
  const [submittingRoleMember, setSubmittingRoleMember] = useState(false);
  const [submittingAccessRequest, setSubmittingAccessRequest] = useState(false);
  const [processingAccessRequestId, setProcessingAccessRequestId] = useState<string | null>(null);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    contact: '',
    insurancePaid: '',
    status: 'Pending' as PaymentStatus,
    joinDate: todayIso(),
  });

  const [memberImportText, setMemberImportText] = useState('');
  const [memberImportFileName, setMemberImportFileName] = useState('');
  const [memberImportPreview, setMemberImportPreview] = useState<MemberImportPreviewRow[]>([]);
  const [importingMembers, setImportingMembers] = useState(false);

  const [newContribution, setNewContribution] = useState({
    memberName: '',
    month: currentMonthName(),
    welfare: '',
    merryGoRound: '',
    insurance: '',
    bereavedFamily: '',
    paidAmount: '',
    paymentStatus: 'Pending' as PaymentStatus,
    paymentDate: todayIso(),
  });

  const [monthlyGenerationDefaults, setMonthlyGenerationDefaults] = useState({
    welfare: '200',
    merryGoRound: '1000',
    insurance: '750',
    bereavedFamily: '0',
    paymentStatus: 'Pending' as PaymentStatus,
    paymentDate: todayIso(),
  });

  const [newRound, setNewRound] = useState({
    roundNumber: '',
    payoutDate: todayIso(),
    recipientName: '',
    payoutAmount: '',
    status: 'Upcoming' as RoundStatus,
  });

  const [newInsurancePolicy, setNewInsurancePolicy] = useState({
    providerName: '',
    policyNumber: '',
    month: currentMonthName(),
    policyStartDate: todayIso(),
    policyEndDate: oneYearFromTodayIso(),
    premiumTarget: '',
    providerContribution: '',
    lastRespectBenefit: '',
    status: 'Active' as InsuranceStatus,
  });

  const [newBereavedCase, setNewBereavedCase] = useState({
    memberName: '',
    familyContact: '',
    month: currentMonthName(),
    caseDate: todayIso(),
    targetAmount: '',
    collectedAmount: '',
    status: 'Open' as BereavedStatus,
    notes: '',
  });

  const [newRoleMember, setNewRoleMember] = useState({
    uid: '',
    email: '',
    displayName: '',
    role: 'Member' as ManagedUserRole,
    status: 'active' as MembershipStatus,
  });

  const [accessRequestForm, setAccessRequestForm] = useState({
    displayName: '',
    phone: '',
    reason: '',
    requestedRole: 'Member' as ManagedUserRole,
  });

  const actorName = currentUser?.displayName || currentUser?.email || currentUserRole;
  const hasRoleAtLeast = (minimumRole: ProtectedRole) => roleRank[currentUserRole] >= roleRank[minimumRole];
  const canManageMembers = hasRoleAtLeast('Admin');
  const canManageFinance = hasRoleAtLeast('Treasurer');
  const canViewReports = hasRoleAtLeast('Treasurer');

  const notify = (message: string, tone: ToastTone = 'info') => {
    const id = Date.now();
    setToast({ id, message, tone });

    window.setTimeout(() => {
      setToast((currentToast) => (currentToast?.id === id ? null : currentToast));
    }, 4200);
  };

  const ToastBanner = () =>
    toast ? (
      <div className="fixed inset-x-3 top-3 z-[80] mx-auto max-w-xl sm:top-5" role="status" aria-live="polite">
        <div
          className={`flex items-start justify-between gap-3 rounded-3xl border px-4 py-3 text-sm shadow-2xl shadow-black/30 backdrop-blur-2xl ${
            toast.tone === 'success'
              ? 'border-emerald-300/30 bg-emerald-400/15 text-emerald-50'
              : toast.tone === 'error'
                ? 'border-rose-300/30 bg-rose-400/15 text-rose-50'
                : toast.tone === 'warning'
                  ? 'border-amber-300/30 bg-amber-400/15 text-amber-50'
                  : 'border-cyan-300/30 bg-cyan-400/15 text-cyan-50'
          }`}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em]">
              {toast.tone === 'success' ? 'Success' : toast.tone === 'error' ? 'Action failed' : toast.tone === 'warning' ? 'Check this' : 'Notice'}
            </p>
            <p className="mt-1 leading-5">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs font-black text-white/90"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      </div>
    ) : null;

  const requireRole = (minimumRole: ProtectedRole, action: string) => {
    if (!currentUser) {
      notify(`Please sign in before you ${action}.`, 'warning');
      return false;
    }

    if (!hasRoleAtLeast(minimumRole)) {
      notify(`You need ${minimumRole} access or higher to ${action}. Current role: ${currentUserRole}.`, 'warning');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Failed to sign in:', error);
      notify('Failed to sign in with Google.', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to sign out:', error);
      notify('Failed to sign out.', 'error');
    }
  };

  const writeAuditLog = async ({
    action,
    module,
    actor = actorName,
    targetId = '',
    targetName = '',
    details,
  }: {
    action: string;
    module: string;
    actor?: string;
    targetId?: string;
    targetName?: string;
    details: string;
  }) => {
    if (!currentUser) return;

    const auditData = {
      action,
      module,
      actor,
      actorUid: currentUser.uid,
      actorEmail: currentUser.email || '',
      targetId,
      targetName,
      details,
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'auditLogs'), auditData);
      setAuditLogs((previous) => [{ id: docRef.id, ...auditData }, ...previous].slice(0, 100));
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  };

  const isLightTheme = themeMode === 'light';
  const themeShellClass = isLightTheme ? 'theme-light' : 'theme-dark';

  const handleThemeToggle = () => {
    setThemeMode((previous) => (previous === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('jirani-mwema-theme');

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeMode(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('jirani-mwema-theme', themeMode);
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      setCurrentUser(firebaseUser);

      if (!firebaseUser) {
        setCurrentUserRole('Guest');
        setAuthLoading(false);
        return;
      }

      try {
        const resolvedRole = await resolveSignedInRole(firebaseUser);
        setCurrentUserRole(resolvedRole);
      } catch (error) {
        console.error('Failed to resolve user role:', error);
        setCurrentUserRole('Guest');
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser || currentUserRole === 'Guest') {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const membersSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'members'));
        const membersList = membersSnapshot.docs.map((documentSnapshot) => {
          const data = documentSnapshot.data();

          return {
            id: documentSnapshot.id,
            name: typeof data.name === 'string' ? data.name : '',
            email: typeof data.email === 'string' ? data.email : '',
            contact: typeof data.contact === 'string' ? data.contact : '',
            insurancePaid: Number(data.insurancePaid) || 0,
            status: data.status === 'Paid' ? 'Paid' : 'Pending',
            joinDate: typeof data.joinDate === 'string' ? data.joinDate : todayIso(),
          } as Member;
        });
        setMembers(membersList);

        const contribSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'contributions'));
        const contribList = contribSnapshot.docs.map((documentSnapshot) => {
          const data = documentSnapshot.data();
          const welfare = toMoneyNumber(data.welfare);
          const merryGoRound = toMoneyNumber(data.merryGoRound);
          const insurance = toMoneyNumber(data.insurance);
          const bereavedFamily = toMoneyNumber(data.bereavedFamily);
          const legacyAmount = toMoneyNumber(data.amount);
          const splitTotal = welfare + merryGoRound + insurance + bereavedFamily;
          const expectedAmount = toMoneyNumber(data.expectedAmount) || toMoneyNumber(data.total) || splitTotal || legacyAmount;
          const storedPaidAmount = toMoneyNumber(data.paidAmount);
          const paidAmount = storedPaidAmount > 0 ? Math.min(storedPaidAmount, expectedAmount) : data.paymentStatus === 'Paid' ? expectedAmount : 0;
          const balance = Math.max(expectedAmount - paidAmount, 0);

          return {
            id: documentSnapshot.id,
            memberName: typeof data.memberName === 'string' ? data.memberName : '',
            month: typeof data.month === 'string' ? data.month : currentMonthName(),
            welfare,
            merryGoRound,
            insurance,
            bereavedFamily,
            total: expectedAmount,
            amount: expectedAmount,
            expectedAmount,
            paidAmount,
            balance,
            paymentStatus: balance <= 0 && expectedAmount > 0 ? 'Paid' : 'Pending',
            paymentDate: typeof data.paymentDate === 'string' ? data.paymentDate : todayIso(),
            verificationStatus: normalizeVerificationStatus(data.verificationStatus),
            verifiedBy: typeof data.verifiedBy === 'string' ? data.verifiedBy : '',
            verifiedAt: typeof data.verifiedAt === 'string' ? data.verifiedAt : '',
            verificationNotes: typeof data.verificationNotes === 'string' ? data.verificationNotes : '',
            createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
            updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
          } as MonthlyContribution;
        });
        setContributions(contribList);

        const mgrSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'rounds'));
        const mgrList = mgrSnapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        })) as MerryGoRoundRound[];
        setMerryGoRound(mgrList.sort((a, b) => a.roundNumber - b.roundNumber));

        const insuranceSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'insurance'));
        const insuranceList = insuranceSnapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        })) as InsurancePolicy[];
        setInsurancePolicies(insuranceList);

        const bereavedSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases'));
        const bereavedList = bereavedSnapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        })) as BereavedCase[];
        setBereavedCases(bereavedList);

        if (canManageMembers) {
          const membershipsSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'memberships'));
          const membershipsList = membershipsSnapshot.docs.map((documentSnapshot) => {
            const data = documentSnapshot.data();

            return {
              id: documentSnapshot.id,
              uid: typeof data.uid === 'string' ? data.uid : documentSnapshot.id,
              email: typeof data.email === 'string' ? data.email : '',
              displayName: typeof data.displayName === 'string' ? data.displayName : '',
              role: normalizeManagedRole(data.role),
              status: normalizeMembershipStatus(data.status || data.membershipStatus),
              groupId: typeof data.groupId === 'string' ? data.groupId : CURRENT_GROUP_ID,
              createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
              updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
              createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
              updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
            } as RoleMembership;
          });
          setRoleMemberships(membershipsList.sort((first, second) => (first.email || first.displayName).localeCompare(second.email || second.displayName)));
        }

        if (canViewReports) {
          const auditSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'auditLogs'));
          const auditList = auditSnapshot.docs.map((documentSnapshot) => {
            const data = documentSnapshot.data();

            return {
              id: documentSnapshot.id,
              action: typeof data.action === 'string' ? data.action : 'Unknown Action',
              module: typeof data.module === 'string' ? data.module : 'General',
              actor: typeof data.actor === 'string' ? data.actor : 'System',
              actorUid: typeof data.actorUid === 'string' ? data.actorUid : '',
              actorEmail: typeof data.actorEmail === 'string' ? data.actorEmail : '',
              targetId: typeof data.targetId === 'string' ? data.targetId : '',
              targetName: typeof data.targetName === 'string' ? data.targetName : '',
              details: typeof data.details === 'string' ? data.details : '',
              createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
            } as AuditLog;
          });
          setAuditLogs(auditList.sort((firstLog, secondLog) => secondLog.createdAt.localeCompare(firstLog.createdAt)).slice(0, 100));
        } else {
          setAuditLogs([]);
        }
      } catch (error) {
        console.error('Error loading dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser, currentUserRole]);


  useEffect(() => {
    async function fetchRoleMemberships() {
      if (!currentUser || !canManageMembers) {
        setRoleMemberships([]);
        return;
      }

      try {
        const membershipsSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'memberships'));
        const membershipsList = membershipsSnapshot.docs.map((documentSnapshot) => {
          const data = documentSnapshot.data();

          return {
            id: documentSnapshot.id,
            uid: typeof data.uid === 'string' ? data.uid : documentSnapshot.id,
            email: typeof data.email === 'string' ? data.email : '',
            displayName: typeof data.displayName === 'string' ? data.displayName : '',
            role: normalizeManagedRole(data.role),
            status: normalizeMembershipStatus(data.status || data.membershipStatus),
            groupId: typeof data.groupId === 'string' ? data.groupId : CURRENT_GROUP_ID,
            createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
            updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
            createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
            updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
          } as RoleMembership;
        });

        setRoleMemberships(membershipsList.sort((first, second) => (first.email || first.displayName).localeCompare(second.email || second.displayName)));
      } catch (error) {
        console.error('Failed to load role memberships:', error);
      }
    }

    fetchRoleMemberships();
  }, [currentUser, canManageMembers]);

  useEffect(() => {
    async function fetchAccessRequests() {
      if (!currentUser) {
        setAccessRequests([]);
        return;
      }

      try {
        if (canManageMembers) {
          const requestsSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'accessRequests'));
          const requestsList = requestsSnapshot.docs.map((documentSnapshot) => buildAccessRequestFromData(documentSnapshot.id, documentSnapshot.data()));
          setAccessRequests(requestsList.sort((first, second) => (second.createdAt || '').localeCompare(first.createdAt || '')));
          return;
        }

        if (currentUserRole === 'Guest') {
          const requestSnapshot = await getDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'accessRequests', currentUser.uid));
          setAccessRequests(requestSnapshot.exists() ? [buildAccessRequestFromData(requestSnapshot.id, requestSnapshot.data())] : []);
          return;
        }

        setAccessRequests([]);
      } catch (error) {
        console.error('Failed to load access requests:', error);
        setAccessRequests([]);
      }
    }

    fetchAccessRequests();
  }, [currentUser, currentUserRole, canManageMembers]);

  const upsertRoleMembershipState = (membership: RoleMembership) => {
    setRoleMemberships((previous) => {
      const next = previous.some((item) => item.uid === membership.uid)
        ? previous.map((item) => (item.uid === membership.uid ? membership : item))
        : [...previous, membership];

      return next.sort((first, second) => (first.email || first.displayName).localeCompare(second.email || second.displayName));
    });
  };

  const saveRoleMembership = async (membership: RoleMembership) => {
    const rolePayload = {
      uid: membership.uid,
      email: membership.email,
      displayName: membership.displayName,
      role: membership.role,
      status: membership.status,
      membershipStatus: membership.status,
      groupId: CURRENT_GROUP_ID,
      createdAt: membership.createdAt || new Date().toISOString(),
      createdBy: membership.createdBy || actorName,
      updatedAt: new Date().toISOString(),
      updatedBy: actorName,
    };

    await Promise.all([
      setDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'memberships', membership.uid), rolePayload, { merge: true }),
      setDoc(doc(db, 'memberships', `membership_${membership.uid}`), rolePayload, { merge: true }),
    ]);
  };

  const handleRoleMembershipSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireRole('Admin', 'manage user roles')) return;

    const uid = newRoleMember.uid.trim();
    const email = newRoleMember.email.trim().toLowerCase();
    const displayName = newRoleMember.displayName.trim();

    if (!uid || !email) {
      notify('Enter the Firebase Auth UID and email for the user.', 'warning');
      return;
    }

    setSubmittingRoleMember(true);
    try {
      const existingMembership = roleMemberships.find((membership) => membership.uid === uid);
      const membership: RoleMembership = {
        id: uid,
        uid,
        email,
        displayName,
        role: newRoleMember.role,
        status: newRoleMember.status,
        groupId: CURRENT_GROUP_ID,
        createdAt: existingMembership?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: existingMembership?.createdBy || actorName,
        updatedBy: actorName,
      };

      await saveRoleMembership(membership);
      upsertRoleMembershipState(membership);
      await writeAuditLog({
        action: existingMembership ? 'Update User Role' : 'Create User Role',
        module: 'Roles',
        targetId: uid,
        targetName: email,
        details: `${email} set to ${newRoleMember.role} with ${newRoleMember.status} status.`,
      });
      setNewRoleMember({ uid: '', email: '', displayName: '', role: 'Member', status: 'active' });
    } catch (error) {
      console.error('Failed to save role membership:', error);
      notify('Failed to save role membership. Confirm you are signed in as Admin.', 'error');
    } finally {
      setSubmittingRoleMember(false);
    }
  };

  const handleCurrentUserRoleBootstrap = () => {
    if (!currentUser) return;

    setNewRoleMember({
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || '',
      role: 'Admin',
      status: 'active',
    });
  };


  const handleAccessRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      notify('Please sign in before requesting access.', 'warning');
      return;
    }

    const displayName = accessRequestForm.displayName.trim() || currentUser.displayName || currentUser.email || '';
    const phone = accessRequestForm.phone.trim();
    const reason = accessRequestForm.reason.trim();

    if (!displayName || !phone || !reason) {
      notify('Enter your name, phone number, and reason for requesting access.', 'warning');
      return;
    }

    const existingRequest = accessRequests.find((request) => request.uid === currentUser.uid);
    const createdAt = existingRequest?.createdAt || new Date().toISOString();
    const requestData = {
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName,
      phone,
      reason,
      requestedRole: accessRequestForm.requestedRole,
      status: 'Pending' as AccessRequestStatus,
      groupId: CURRENT_GROUP_ID,
      createdAt,
      updatedAt: new Date().toISOString(),
    };

    setSubmittingAccessRequest(true);
    try {
      await setDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'accessRequests', currentUser.uid), requestData, { merge: true });
      setAccessRequests([{ id: currentUser.uid, ...requestData }]);
      notify('Your access request has been sent to the Admin.', 'success');
    } catch (error) {
      console.error('Failed to submit access request:', error);
      notify('Failed to submit access request. Confirm Firestore Step 12 rules are deployed.', 'error');
    } finally {
      setSubmittingAccessRequest(false);
    }
  };

  const handleApproveAccessRequest = async (requestItem: AccessRequest) => {
    if (!requireRole('Admin', 'approve access requests')) return;

    const role = accessApprovalRoles[requestItem.id] || requestItem.requestedRole || 'Member';
    const now = new Date().toISOString();
    const membership: RoleMembership = {
      id: requestItem.uid,
      uid: requestItem.uid,
      email: requestItem.email,
      displayName: requestItem.displayName,
      role,
      status: 'active',
      groupId: CURRENT_GROUP_ID,
      createdAt: now,
      updatedAt: now,
      createdBy: actorName,
      updatedBy: actorName,
    };

    setProcessingAccessRequestId(requestItem.id);
    try {
      await saveRoleMembership(membership);
      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'accessRequests', requestItem.id), {
        status: 'Approved',
        approvedRole: role,
        reviewedAt: now,
        reviewedBy: actorName,
        adminNotes: `Approved as ${role}`,
        updatedAt: now,
      });

      upsertRoleMembershipState(membership);
      setAccessRequests((previous) =>
        previous.map((item) =>
          item.id === requestItem.id
            ? { ...item, status: 'Approved', approvedRole: role, reviewedAt: now, reviewedBy: actorName, adminNotes: `Approved as ${role}`, updatedAt: now }
            : item
        )
      );
      await writeAuditLog({
        action: 'Approve Access Request',
        module: 'Access Requests',
        targetId: requestItem.uid,
        targetName: requestItem.email || requestItem.displayName,
        details: `${requestItem.displayName || requestItem.email} approved as ${role}.`,
      });
      notify(`${requestItem.displayName || requestItem.email} approved as ${role}.`, 'success');
    } catch (error) {
      console.error('Failed to approve access request:', error);
      notify('Failed to approve access request. Confirm Step 12 rules are deployed.', 'error');
    } finally {
      setProcessingAccessRequestId(null);
    }
  };

  const handleRejectAccessRequest = async (requestItem: AccessRequest) => {
    if (!requireRole('Admin', 'reject access requests')) return;

    const adminNotes = window.prompt('Reason for rejection?', 'Not approved at this time.') || 'Rejected by Admin';
    const now = new Date().toISOString();

    setProcessingAccessRequestId(requestItem.id);
    try {
      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'accessRequests', requestItem.id), {
        status: 'Rejected',
        reviewedAt: now,
        reviewedBy: actorName,
        adminNotes,
        updatedAt: now,
      });

      setAccessRequests((previous) =>
        previous.map((item) =>
          item.id === requestItem.id
            ? { ...item, status: 'Rejected', reviewedAt: now, reviewedBy: actorName, adminNotes, updatedAt: now }
            : item
        )
      );
      await writeAuditLog({
        action: 'Reject Access Request',
        module: 'Access Requests',
        targetId: requestItem.uid,
        targetName: requestItem.email || requestItem.displayName,
        details: `${requestItem.displayName || requestItem.email} rejected. Reason: ${adminNotes}`,
      });
    } catch (error) {
      console.error('Failed to reject access request:', error);
      notify('Failed to reject access request.', 'error');
    } finally {
      setProcessingAccessRequestId(null);
    }
  };

  const handleRoleChange = async (membership: RoleMembership, role: ManagedUserRole) => {
    if (!requireRole('Admin', 'change user roles')) return;

    const updatedMembership: RoleMembership = {
      ...membership,
      role,
      updatedAt: new Date().toISOString(),
      updatedBy: actorName,
    };

    try {
      await saveRoleMembership(updatedMembership);
      upsertRoleMembershipState(updatedMembership);
      await writeAuditLog({
        action: 'Change User Role',
        module: 'Roles',
        targetId: membership.uid,
        targetName: membership.email || membership.displayName,
        details: `${membership.email || membership.displayName} changed to ${role}.`,
      });
    } catch (error) {
      console.error('Failed to update user role:', error);
      notify('Failed to update user role.', 'error');
    }
  };

  const handleRoleStatusChange = async (membership: RoleMembership, status: MembershipStatus) => {
    if (!requireRole('Admin', 'change user access status')) return;

    const updatedMembership: RoleMembership = {
      ...membership,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: actorName,
    };

    try {
      await saveRoleMembership(updatedMembership);
      upsertRoleMembershipState(updatedMembership);
      await writeAuditLog({
        action: 'Change User Status',
        module: 'Roles',
        targetId: membership.uid,
        targetName: membership.email || membership.displayName,
        details: `${membership.email || membership.displayName} status changed to ${status}.`,
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
      notify('Failed to update user status.', 'error');
    }
  };

  const handleDeleteRoleMembership = async (membership: RoleMembership) => {
    if (!requireRole('Admin', 'remove user access')) return;
    if (!confirm(`Remove role access for ${membership.email || membership.displayName || membership.uid}?`)) return;

    try {
      await Promise.all([
        deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'memberships', membership.uid)),
        deleteDoc(doc(db, 'memberships', `membership_${membership.uid}`)),
      ]);
      setRoleMemberships((previous) => previous.filter((item) => item.uid !== membership.uid));
      await writeAuditLog({
        action: 'Remove User Role',
        module: 'Roles',
        targetId: membership.uid,
        targetName: membership.email || membership.displayName,
        details: `Removed role access for ${membership.email || membership.displayName || membership.uid}.`,
      });
    } catch (error) {
      console.error('Failed to remove user role:', error);
      notify('Failed to remove user role.', 'error');
    }
  };

  const buildMemberImportPreview = (rawText: string): MemberImportPreviewRow[] => {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    const firstRowCells = parseDelimitedMemberLine(lines[0]);
    const normalizedHeaders = firstRowCells.map(normalizeImportHeader);
    const hasHeaderRow = normalizedHeaders.some((header) =>
      ['name', 'fullname', 'membername', 'member', 'email', 'phone', 'contact'].includes(header)
    );

    const headerIndex = (aliases: string[]) => {
      const aliasSet = new Set(aliases.map(normalizeImportHeader));
      return normalizedHeaders.findIndex((header) => aliasSet.has(header));
    };

    const nameIndex = headerIndex(['name', 'full name', 'member name', 'member']);
    const emailIndex = headerIndex(['email', 'email address']);
    const contactIndex = headerIndex(['contact', 'phone', 'phone number', 'mobile', 'telephone']);
    const insurancePaidIndex = headerIndex(['insurance paid', 'insurancePaid', 'insurance', 'amount']);
    const statusIndex = headerIndex(['status', 'payment status', 'insurance status']);
    const joinDateIndex = headerIndex(['join date', 'joinDate', 'date joined', 'joined']);

    const existingNameKeys = new Set(members.map((member) => normalizeMemberKey(member.name)).filter(Boolean));
    const existingEmailKeys = new Set(members.map((member) => normalizeMemberKey(member.email)).filter(Boolean));
    const importedNameKeys = new Set<string>();
    const importedEmailKeys = new Set<string>();

    return lines.slice(hasHeaderRow ? 1 : 0).map((line, index) => {
      const rowNumber = index + (hasHeaderRow ? 2 : 1);
      const cells = parseDelimitedMemberLine(line);

      const valueFromHeader = (selectedIndex: number, fallbackIndex: number) =>
        selectedIndex >= 0 ? cells[selectedIndex] || '' : cells[fallbackIndex] || '';

      const name = valueFromHeader(nameIndex, 0).trim();
      const email = valueFromHeader(emailIndex, 1).trim();
      const contact = valueFromHeader(contactIndex, 2).trim();
      const insurancePaid = toMoneyNumber(valueFromHeader(insurancePaidIndex, 3));
      const status = normalizeImportedPaymentStatus(valueFromHeader(statusIndex, 4));
      const joinDate = valueFromHeader(joinDateIndex, 5) || todayIso();

      const nameKey = normalizeMemberKey(name);
      const emailKey = normalizeMemberKey(email);
      const duplicate =
        !!nameKey &&
        (existingNameKeys.has(nameKey) ||
          importedNameKeys.has(nameKey) ||
          (!!emailKey && (existingEmailKeys.has(emailKey) || importedEmailKeys.has(emailKey))));

      let error = '';

      if (!name) {
        error = 'Missing member name';
      } else if (duplicate) {
        error = 'Duplicate member';
      }

      if (nameKey) importedNameKeys.add(nameKey);
      if (emailKey) importedEmailKeys.add(emailKey);

      return {
        rowNumber,
        name,
        email,
        contact,
        insurancePaid,
        status,
        joinDate,
        duplicate,
        error,
      };
    });
  };

  const handlePreviewMemberImport = () => {
    const previewRows = buildMemberImportPreview(memberImportText);
    setMemberImportPreview(previewRows);

    if (previewRows.length === 0) {
      notify('Paste member rows or upload a CSV file first.', 'warning');
      return;
    }

    const validRows = previewRows.filter((row) => !row.error);
    const errorRows = previewRows.length - validRows.length;
    notify(`Preview ready: ${validRows.length} valid row(s), ${errorRows} row(s) need attention.`, errorRows > 0 ? 'warning' : 'success');
  };

  const handleMemberImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const fileText = await file.text();
      setMemberImportText(fileText);
      setMemberImportFileName(file.name);
      const previewRows = buildMemberImportPreview(fileText);
      setMemberImportPreview(previewRows);
      notify(`Loaded ${file.name}. Review the preview before importing.`, 'success');
    } catch (error) {
      console.error('Failed to read member import file:', error);
      notify('Failed to read the selected file.', 'error');
    } finally {
      event.target.value = '';
    }
  };

  const handleClearMemberImport = () => {
    setMemberImportText('');
    setMemberImportFileName('');
    setMemberImportPreview([]);
  };

  const handleImportMembers = async () => {
    if (!requireRole('Admin', 'import members')) return;

    const previewRows = memberImportPreview.length > 0 ? memberImportPreview : buildMemberImportPreview(memberImportText);
    const validRows = previewRows.filter((row) => !row.error);

    setMemberImportPreview(previewRows);

    if (validRows.length === 0) {
      notify('No valid members to import. Check the preview for missing names or duplicates.', 'warning');
      return;
    }

    setImportingMembers(true);

    try {
      const createdMembers: Member[] = await Promise.all(
        validRows.map(async (row) => {
          const memberData = {
            name: row.name.trim(),
            email: row.email.trim(),
            contact: row.contact.trim(),
            insurancePaid: row.insurancePaid,
            status: row.status,
            joinDate: row.joinDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'members'), memberData);

          return {
            id: docRef.id,
            ...memberData,
          };
        })
      );

      setMembers((previous) => [...previous, ...createdMembers].sort((firstMember, secondMember) => firstMember.name.localeCompare(secondMember.name)));

      await writeAuditLog({
        action: 'Import Members',
        module: 'Members',
        actor: actorName,
        targetName: `${createdMembers.length} member(s)`,
        details: `Imported ${createdMembers.length} member record(s).`,
      });

      handleClearMemberImport();
      notify(`Imported ${createdMembers.length} member(s).`, 'success');
    } catch (error) {
      console.error('Failed to import members:', error);
      notify('Failed to import members.', 'error');
    } finally {
      setImportingMembers(false);
    }
  };

  const handleAddMemberSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireRole('Admin', 'add members')) return;
    if (!newMember.name.trim()) return;

    setSubmittingMember(true);
    try {
      const memberData = {
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        contact: newMember.contact.trim(),
        insurancePaid: Number(newMember.insurancePaid) || 0,
        status: newMember.status,
        joinDate: newMember.joinDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'members'), memberData);
      setMembers((previous) => [...previous, { id: docRef.id, ...memberData }]);
      await writeAuditLog({
        action: 'Create Member',
        module: 'Members',
        actor: actorName,
        targetId: docRef.id,
        targetName: memberData.name,
        details: `Created member ${memberData.name}.`,
      });
      setNewMember({ name: '', email: '', contact: '', insurancePaid: '', status: 'Pending', joinDate: todayIso() });
    } catch (error) {
      console.error('Error creating member record:', error);
      notify('Failed to create member.', 'error');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleAddContributionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireRole('Treasurer', 'record monthly contributions')) return;
    if (!newContribution.memberName.trim()) return;

    const welfare = toMoneyNumber(newContribution.welfare);
    const merryGoRound = toMoneyNumber(newContribution.merryGoRound);
    const insurance = toMoneyNumber(newContribution.insurance);
    const bereavedFamily = toMoneyNumber(newContribution.bereavedFamily);
    const total = welfare + merryGoRound + insurance + bereavedFamily;
    const rawPaidAmount = toMoneyNumber(newContribution.paidAmount);
    const paidAmount = newContribution.paymentStatus === 'Paid' && rawPaidAmount <= 0 ? total : Math.min(rawPaidAmount, total);
    const balance = Math.max(total - paidAmount, 0);
    const paymentStatus: PaymentStatus = balance <= 0 && total > 0 ? 'Paid' : 'Pending';

    if (total <= 0) {
      notify('Enter at least one contribution amount.', 'warning');
      return;
    }

    setSubmittingContribution(true);
    try {
      const contributionData = {
        memberName: newContribution.memberName.trim(),
        month: newContribution.month.trim(),
        welfare,
        merryGoRound,
        insurance,
        bereavedFamily,
        total,
        amount: total,
        expectedAmount: total,
        paidAmount,
        balance,
        paymentStatus,
        paymentDate: newContribution.paymentDate,
        verificationStatus: 'Unverified' as VerificationStatus,
        verifiedBy: '',
        verifiedAt: '',
        verificationNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'contributions'), contributionData);
      setContributions((previous) => [...previous, { id: docRef.id, ...contributionData }]);
      await writeAuditLog({
        action: 'Create Contribution',
        module: 'Contributions',
        actor: actorName,
        targetId: docRef.id,
        targetName: contributionData.memberName,
        details: `Recorded ${contributionData.month} contribution for ${contributionData.memberName}; expected KES ${contributionData.expectedAmount}, paid KES ${contributionData.paidAmount}, balance KES ${contributionData.balance}.`,
      });
      setNewContribution({
        memberName: '',
        month: currentMonthName(),
        welfare: '',
        merryGoRound: '',
        insurance: '',
        bereavedFamily: '',
        paidAmount: '',
        paymentStatus: 'Pending',
        paymentDate: todayIso(),
      });
    } catch (error) {
      console.error('Error tracking contribution:', error);
      notify('Failed to log contribution.', 'error');
    } finally {
      setSubmittingContribution(false);
    }
  };

  const handleGenerateMonthlyRows = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireRole('Treasurer', 'generate monthly contribution rows')) return;

    const month = generationMonth.trim();
    if (!month) {
      notify('Enter the month to generate.', 'warning');
      return;
    }

    if (members.length === 0) {
      notify('Add members before generating monthly contribution rows.');
      return;
    }

    const existingKeys = new Set(
      contributions.map((contribution) => `${contribution.memberName.trim().toLowerCase()}::${contribution.month.trim().toLowerCase()}`)
    );

    const membersWithoutRows = members.filter((member) => {
      const key = `${member.name.trim().toLowerCase()}::${month.toLowerCase()}`;
      return member.name.trim().length > 0 && !existingKeys.has(key);
    });

    if (membersWithoutRows.length === 0) {
      notify(`All members already have contribution rows for ${month}.`, 'warning');
      return;
    }

    const welfare = toMoneyNumber(monthlyGenerationDefaults.welfare);
    const merryGoRound = toMoneyNumber(monthlyGenerationDefaults.merryGoRound);
    const insurance = toMoneyNumber(monthlyGenerationDefaults.insurance);
    const bereavedFamily = toMoneyNumber(monthlyGenerationDefaults.bereavedFamily);
    const total = welfare + merryGoRound + insurance + bereavedFamily;
    const paidAmount = monthlyGenerationDefaults.paymentStatus === 'Paid' ? total : 0;
    const balance = Math.max(total - paidAmount, 0);

    setGeneratingMonthlyRows(true);

    try {
      const createdRows: MonthlyContribution[] = await Promise.all(
        membersWithoutRows.map(async (member) => {
          const paymentStatus: PaymentStatus = balance <= 0 && total > 0 ? 'Paid' : 'Pending';

          const rowData: Omit<MonthlyContribution, 'id'> = {
            memberName: member.name.trim(),
            month,
            welfare,
            merryGoRound,
            insurance,
            bereavedFamily,
            total,
            amount: total,
            expectedAmount: total,
            paidAmount,
            balance,
            paymentStatus,
            paymentDate: monthlyGenerationDefaults.paymentDate,
            verificationStatus: 'Unverified',
            verifiedBy: '',
            verifiedAt: '',
            verificationNotes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'contributions'), rowData);

          return {
            id: docRef.id,
            ...rowData,
          };
        })
      );

      setContributions((previous) => [...previous, ...createdRows]);
      await writeAuditLog({
        action: 'Generate Monthly Rows',
        module: 'Contributions',
        actor: actorName,
        targetName: month,
        details: `Generated ${createdRows.length} monthly contribution row(s) for ${month}.`,
      });
      setContributionMonthFilter(month);
      setContributionStatusFilter('All');
      notify(`Generated ${createdRows.length} monthly contribution row(s) for ${month}.`, 'success');
    } catch (error) {
      console.error('Failed to generate monthly contribution rows:', error);
      notify('Failed to generate monthly contribution rows.', 'error');
    } finally {
      setGeneratingMonthlyRows(false);
    }
  };

  const handleAddRoundSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireRole('Treasurer', 'create merry-go-round rounds')) return;
    if (!newRound.recipientName.trim() || !newRound.roundNumber) return;

    setSubmittingRound(true);
    try {
      const roundData = {
        roundNumber: Number(newRound.roundNumber),
        payoutDate: newRound.payoutDate,
        recipientName: newRound.recipientName.trim(),
        payoutAmount: Number(newRound.payoutAmount) || 0,
        status: newRound.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'rounds'), roundData);
      setMerryGoRound((previous) => [...previous, { id: docRef.id, ...roundData }].sort((a, b) => a.roundNumber - b.roundNumber));
      await writeAuditLog({
        action: 'Create Merry-Go-Round Round',
        module: 'Merry-Go-Round',
        actor: actorName,
        targetId: docRef.id,
        targetName: roundData.recipientName,
        details: `Scheduled round ${roundData.roundNumber} for ${roundData.recipientName}.`,
      });
      setNewRound({ roundNumber: '', payoutDate: todayIso(), recipientName: '', payoutAmount: '', status: 'Upcoming' });
    } catch (error) {
      console.error('Error building schedule timeline:', error);
      notify('Failed to schedule round.', 'error');
    } finally {
      setSubmittingRound(false);
    }
  };

  const handleAddInsurancePolicySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireRole('Admin', 'create insurance policies')) return;
    if (!newInsurancePolicy.providerName.trim()) return;

    setSubmittingInsurance(true);
    try {
      const policyData = {
        providerName: newInsurancePolicy.providerName.trim(),
        policyNumber: newInsurancePolicy.policyNumber.trim(),
        month: newInsurancePolicy.month.trim(),
        policyStartDate: newInsurancePolicy.policyStartDate,
        policyEndDate: newInsurancePolicy.policyEndDate,
        premiumTarget: Number(newInsurancePolicy.premiumTarget) || 0,
        providerContribution: Number(newInsurancePolicy.providerContribution) || 0,
        lastRespectBenefit: Number(newInsurancePolicy.lastRespectBenefit) || 0,
        status: newInsurancePolicy.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'insurance'), policyData);
      setInsurancePolicies((previous) => [{ id: docRef.id, ...policyData }, ...previous]);
      await writeAuditLog({
        action: 'Create Insurance Policy',
        module: 'Insurance',
        actor: actorName,
        targetId: docRef.id,
        targetName: policyData.providerName,
        details: `Created insurance policy for ${policyData.providerName}.`,
      });
      setNewInsurancePolicy({
        providerName: '',
        policyNumber: '',
        month: currentMonthName(),
        policyStartDate: todayIso(),
        policyEndDate: oneYearFromTodayIso(),
        premiumTarget: '',
        providerContribution: '',
        lastRespectBenefit: '',
        status: 'Active',
      });
    } catch (error) {
      console.error('Error creating insurance policy:', error);
      notify('Failed to create insurance policy.', 'error');
    } finally {
      setSubmittingInsurance(false);
    }
  };

  const handleAddBereavedCaseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireRole('Admin', 'create bereaved support cases')) return;
    if (!newBereavedCase.memberName.trim()) return;

    setSubmittingBereavedCase(true);
    try {
      const targetAmount = Number(newBereavedCase.targetAmount) || 0;
      const collectedAmount = Number(newBereavedCase.collectedAmount) || 0;
      const status: BereavedStatus = collectedAmount >= targetAmount && targetAmount > 0 ? 'Closed' : newBereavedCase.status;
      const caseData = {
        memberName: newBereavedCase.memberName.trim(),
        familyContact: newBereavedCase.familyContact.trim(),
        month: newBereavedCase.month.trim(),
        caseDate: newBereavedCase.caseDate,
        targetAmount,
        collectedAmount,
        status,
        notes: newBereavedCase.notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases'), caseData);
      setBereavedCases((previous) => [{ id: docRef.id, ...caseData }, ...previous]);
      await writeAuditLog({
        action: 'Create Bereaved Case',
        module: 'Bereaved Support',
        actor: actorName,
        targetId: docRef.id,
        targetName: caseData.memberName,
        details: `Created bereaved support case for ${caseData.memberName}.`,
      });
      setNewBereavedCase({
        memberName: '',
        familyContact: '',
        month: currentMonthName(),
        caseDate: todayIso(),
        targetAmount: '',
        collectedAmount: '',
        status: 'Open',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating bereaved case:', error);
      notify('Failed to create bereaved family case.', 'error');
    } finally {
      setSubmittingBereavedCase(false);
    }
  };

  const startEditing = (member: Member) => {
    if (!requireRole('Admin', 'edit members')) return;
    setEditingMemberId(member.id);
    setEditForm(member);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({
      ...previous,
      [name]: name === 'insurancePaid' ? Number(value) : value,
    }));
  };

  const saveMemberChanges = async (id: string) => {
    if (!requireRole('Admin', 'edit members')) return;
    try {
      const memberRef = doc(db, 'groups', CURRENT_GROUP_ID, 'members', id);
      await updateDoc(memberRef, {
        name: editForm.name ?? '',
        email: editForm.email ?? '',
        contact: editForm.contact ?? '',
        insurancePaid: Number(editForm.insurancePaid) || 0,
        status: editForm.status ?? 'Pending',
        joinDate: editForm.joinDate ?? todayIso(),
        updatedAt: new Date().toISOString(),
      });

      setMembers((previous) => previous.map((member) => (member.id === id ? { ...member, ...(editForm as Member) } : member)));
      await writeAuditLog({
        action: 'Update Member',
        module: 'Members',
        actor: actorName,
        targetId: id,
        targetName: editForm.name || 'Member',
        details: `Updated member ${editForm.name || id}.`,
      });
      setEditingMemberId(null);
    } catch (error) {
      console.error('Failed to commit member updates:', error);
      notify('Failed to update member.', 'error');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!requireRole('Admin', 'delete members')) return;
    const targetMember = members.find((member) => member.id === id);
    if (!window.confirm('Remove this member from the database?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'members', id));
      setMembers((previous) => previous.filter((member) => member.id !== id));
      await writeAuditLog({
        action: 'Delete Member',
        module: 'Members',
        actor: actorName,
        targetId: id,
        targetName: targetMember?.name || 'Member',
        details: `Deleted member ${targetMember?.name || id}.`,
      });
    } catch (error) {
      console.error('Failed to delete member:', error);
      notify('Failed to delete member.', 'error');
    }
  };

  const startEditingContribution = (contribution: MonthlyContribution) => {
    if (!requireRole('Treasurer', 'edit monthly contributions')) return;
    setEditingContributionId(contribution.id);
    setContributionEditForm(contributionToEditForm(contribution));
  };

  const cancelContributionEditing = () => {
    setEditingContributionId(null);
    setContributionEditForm(emptyContributionEditForm());
  };

  const handleContributionEditChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setContributionEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveContributionChanges = async (id: string) => {
    if (!requireRole('Treasurer', 'save monthly contribution edits')) return;
    if (!contributionEditForm.memberName.trim()) {
      notify('Member name is required.');
      return;
    }

    const welfare = toMoneyNumber(contributionEditForm.welfare);
    const merryGoRound = toMoneyNumber(contributionEditForm.merryGoRound);
    const insurance = toMoneyNumber(contributionEditForm.insurance);
    const bereavedFamily = toMoneyNumber(contributionEditForm.bereavedFamily);
    const total = welfare + merryGoRound + insurance + bereavedFamily;
    const rawPaidAmount = toMoneyNumber(contributionEditForm.paidAmount);
    const paidAmount = contributionEditForm.paymentStatus === 'Paid' && rawPaidAmount <= 0 ? total : Math.min(rawPaidAmount, total);
    const balance = Math.max(total - paidAmount, 0);
    const paymentStatus: PaymentStatus = balance <= 0 && total > 0 ? 'Paid' : 'Pending';
    const updatedAt = new Date().toISOString();

    if (total <= 0) {
      notify('Enter at least one contribution amount before saving.', 'warning');
      return;
    }

    try {
      const updatedContribution = {
        memberName: contributionEditForm.memberName.trim(),
        month: contributionEditForm.month.trim() || currentMonthName(),
        welfare,
        merryGoRound,
        insurance,
        bereavedFamily,
        total,
        amount: total,
        expectedAmount: total,
        paidAmount,
        balance,
        paymentStatus,
        paymentDate: contributionEditForm.paymentDate || todayIso(),
        verificationStatus: 'Unverified' as VerificationStatus,
        verifiedBy: '',
        verifiedAt: '',
        verificationNotes: 'Reset after contribution edit',
        updatedAt,
      };

      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'contributions', id), updatedContribution);

      setContributions((previous) =>
        previous.map((contribution) =>
          contribution.id === id
            ? {
                ...contribution,
                ...updatedContribution,
              }
            : contribution
        )
      );

      await writeAuditLog({
        action: 'Update Contribution',
        module: 'Contributions',
        actor: actorName,
        targetId: id,
        targetName: updatedContribution.memberName,
        details: `Updated ${updatedContribution.month} contribution for ${updatedContribution.memberName}.`,
      });
      cancelContributionEditing();
    } catch (error) {
      console.error('Failed to update contribution:', error);
      notify('Failed to update monthly contribution.', 'error');
    }
  };

  const markContributionStatus = async (id: string, paymentStatus: PaymentStatus) => {
    if (!requireRole('Treasurer', 'update payment status')) return;
    const targetContribution = contributions.find((contribution) => contribution.id === id);
    if (!targetContribution) return;

    const expectedAmount = getContributionTotal(targetContribution);
    const paidAmount = paymentStatus === 'Paid' ? expectedAmount : 0;
    const balance = Math.max(expectedAmount - paidAmount, 0);
    const updatedAt = new Date().toISOString();
    const paymentDate = paymentStatus === 'Paid' ? todayIso() : '';

    try {
      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'contributions', id), {
        paidAmount,
        balance,
        paymentStatus,
        paymentDate,
        verificationStatus: 'Unverified',
        verifiedBy: '',
        verifiedAt: '',
        verificationNotes: 'Reset after payment status change',
        updatedAt,
      });

      setContributions((previous) =>
        previous.map((contribution) =>
          contribution.id === id
            ? {
                ...contribution,
                paidAmount,
                balance,
                paymentStatus,
                paymentDate,
                verificationStatus: 'Unverified',
                verifiedBy: '',
                verifiedAt: '',
                verificationNotes: 'Reset after payment status change',
                updatedAt,
              }
            : contribution
        )
      );
      await writeAuditLog({
        action: 'Update Payment Status',
        module: 'Contributions',
        actor: actorName,
        targetId: id,
        targetName: targetContribution.memberName,
        details: `Marked ${targetContribution.memberName}'s ${targetContribution.month} contribution as ${paymentStatus}.`,
      });
    } catch (error) {
      console.error('Failed to update contribution status:', error);
      notify('Failed to update contribution status.', 'error');
    }
  };

  const updateContributionVerification = async (id: string, verificationStatus: VerificationStatus) => {
    if (!requireRole('Treasurer', 'verify payments')) return;
    const targetContribution = contributions.find((contribution) => contribution.id === id);
    if (!targetContribution) return;

    const defaultVerifier = targetContribution.verifiedBy || 'Treasurer';
    const verifiedBy =
      verificationStatus === 'Unverified'
        ? ''
        : window.prompt('Enter verifier name:', defaultVerifier)?.trim() || defaultVerifier;

    if (verificationStatus !== 'Unverified' && !verifiedBy.trim()) {
      notify('Verifier name is required.');
      return;
    }

    const defaultNotes =
      verificationStatus === 'Rejected'
        ? targetContribution.verificationNotes || 'Payment needs review'
        : targetContribution.verificationNotes || '';
    const verificationNotes =
      verificationStatus === 'Unverified'
        ? ''
        : window.prompt('Verification notes:', defaultNotes)?.trim() || defaultNotes;
    const verifiedAt = verificationStatus === 'Unverified' ? '' : new Date().toISOString();
    const updatedAt = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'contributions', id), {
        verificationStatus,
        verifiedBy,
        verifiedAt,
        verificationNotes,
        updatedAt,
      });

      setContributions((previous) =>
        previous.map((contribution) =>
          contribution.id === id
            ? {
                ...contribution,
                verificationStatus,
                verifiedBy,
                verifiedAt,
                verificationNotes,
                updatedAt,
              }
            : contribution
        )
      );
      await writeAuditLog({
        action: 'Update Payment Verification',
        module: 'Contributions',
        actor: verifiedBy || 'System',
        targetId: id,
        targetName: targetContribution.memberName,
        details: `Set ${targetContribution.memberName}'s ${targetContribution.month} verification status to ${verificationStatus}. Notes: ${verificationNotes || 'None'}.`,
      });
    } catch (error) {
      console.error('Failed to update payment verification:', error);
      notify('Failed to update payment verification.', 'error');
    }
  };

  const handleDeleteContribution = async (id: string) => {
    if (!requireRole('Treasurer', 'delete monthly contributions')) return;
    const targetContribution = contributions.find((contribution) => contribution.id === id);
    if (!window.confirm('Delete this contribution record?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'contributions', id));
      setContributions((previous) => previous.filter((contribution) => contribution.id !== id));
      await writeAuditLog({
        action: 'Delete Contribution',
        module: 'Contributions',
        actor: actorName,
        targetId: id,
        targetName: targetContribution?.memberName || 'Contribution',
        details: `Deleted ${targetContribution?.month || ''} contribution for ${targetContribution?.memberName || id}.`,
      });
    } catch (error) {
      console.error('Failed to delete contribution:', error);
      notify('Failed to delete contribution.', 'error');
    }
  };

  const handleDeleteRound = async (id: string) => {
    if (!requireRole('Treasurer', 'delete merry-go-round rounds')) return;
    const targetRound = merryGoRound.find((round) => round.id === id);
    if (!window.confirm('Delete this merry-go-round round?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'rounds', id));
      setMerryGoRound((previous) => previous.filter((round) => round.id !== id));
      await writeAuditLog({
        action: 'Delete Merry-Go-Round Round',
        module: 'Merry-Go-Round',
        actor: actorName,
        targetId: id,
        targetName: targetRound?.recipientName || 'Round',
        details: `Deleted merry-go-round round ${targetRound?.roundNumber || id}.`,
      });
    } catch (error) {
      console.error('Failed to delete round:', error);
      notify('Failed to delete round.', 'error');
    }
  };

  const markRoundAsCompleted = async (id: string) => {
    if (!requireRole('Treasurer', 'complete merry-go-round rounds')) return;
    try {
      const completedAt = new Date().toISOString();
      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'rounds', id), {
        status: 'Completed',
        completedAt,
        updatedAt: completedAt,
      });
      setMerryGoRound((previous) => previous.map((round) => (round.id === id ? { ...round, status: 'Completed', completedAt } : round)));
      const targetRound = merryGoRound.find((round) => round.id === id);
      await writeAuditLog({
        action: 'Complete Merry-Go-Round Round',
        module: 'Merry-Go-Round',
        actor: actorName,
        targetId: id,
        targetName: targetRound?.recipientName || 'Round',
        details: `Marked round ${targetRound?.roundNumber || id} as completed.`,
      });
    } catch (error) {
      console.error('Failed to complete round:', error);
      notify('Failed to complete round.', 'error');
    }
  };

  const handleDeleteInsurancePolicy = async (id: string) => {
    if (!requireRole('Admin', 'delete insurance policies')) return;
    const targetPolicy = insurancePolicies.find((policy) => policy.id === id);
    if (!window.confirm('Delete this insurance provider policy record?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'insurance', id));
      setInsurancePolicies((previous) => previous.filter((policy) => policy.id !== id));
      await writeAuditLog({
        action: 'Delete Insurance Policy',
        module: 'Insurance',
        actor: actorName,
        targetId: id,
        targetName: targetPolicy?.providerName || 'Policy',
        details: `Deleted insurance policy ${targetPolicy?.policyNumber || id}.`,
      });
    } catch (error) {
      console.error('Failed to delete insurance policy:', error);
      notify('Failed to delete insurance policy.', 'error');
    }
  };

  const handleDeleteBereavedCase = async (id: string) => {
    if (!requireRole('Admin', 'delete bereaved support cases')) return;
    const targetCase = bereavedCases.find((caseItem) => caseItem.id === id);
    if (!window.confirm('Delete this bereaved family case?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases', id));
      setBereavedCases((previous) => previous.filter((caseItem) => caseItem.id !== id));
      await writeAuditLog({
        action: 'Delete Bereaved Case',
        module: 'Bereaved Support',
        actor: actorName,
        targetId: id,
        targetName: targetCase?.memberName || 'Bereaved Case',
        details: `Deleted bereaved support case for ${targetCase?.memberName || id}.`,
      });
    } catch (error) {
      console.error('Failed to delete bereaved case:', error);
      notify('Failed to delete bereaved case.', 'error');
    }
  };

  const markBereavedCaseClosed = async (id: string) => {
    if (!requireRole('Admin', 'close bereaved support cases')) return;
    try {
      const updatedAt = new Date().toISOString();
      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases', id), {
        status: 'Closed',
        updatedAt,
      });
      setBereavedCases((previous) => previous.map((caseItem) => (caseItem.id === id ? { ...caseItem, status: 'Closed', updatedAt } : caseItem)));
      const targetCase = bereavedCases.find((caseItem) => caseItem.id === id);
      await writeAuditLog({
        action: 'Close Bereaved Case',
        module: 'Bereaved Support',
        actor: actorName,
        targetId: id,
        targetName: targetCase?.memberName || 'Bereaved Case',
        details: `Marked bereaved support case for ${targetCase?.memberName || id} as closed.`,
      });
    } catch (error) {
      console.error('Failed to close bereaved case:', error);
      notify('Failed to close bereaved family case.', 'error');
    }
  };

  const availableContributionMonths: string[] = Array.from(
    new Set<string>(contributions.map((contribution) => contribution.month).filter(Boolean))
  ).sort((firstMonth, secondMonth) => firstMonth.localeCompare(secondMonth));

  const normalizedContributionSearch = contributionMemberSearch.trim().toLowerCase();
  const generationDuplicateKeys = new Set(
    contributions.map((contribution) => `${contribution.memberName.trim().toLowerCase()}::${generationMonth.trim().toLowerCase()}`)
  );
  const generationEligibleMembers = members.filter((member) => member.name.trim().length > 0);
  const generationMissingMembers = generationEligibleMembers.filter(
    (member) => !generationDuplicateKeys.has(`${member.name.trim().toLowerCase()}::${generationMonth.trim().toLowerCase()}`)
  );
  const generationDefaultTotal =
    toMoneyNumber(monthlyGenerationDefaults.welfare) +
    toMoneyNumber(monthlyGenerationDefaults.merryGoRound) +
    toMoneyNumber(monthlyGenerationDefaults.insurance) +
    toMoneyNumber(monthlyGenerationDefaults.bereavedFamily);

  const filteredContributions = contributions.filter((contribution) => {
    const matchesMember =
      normalizedContributionSearch.length === 0 ||
      contribution.memberName.toLowerCase().includes(normalizedContributionSearch);

    const matchesMonth =
      contributionMonthFilter === 'All' || contribution.month === contributionMonthFilter;

    const matchesStatus =
      contributionStatusFilter === 'All' || contribution.paymentStatus === contributionStatusFilter;

    const matchesVerification =
      contributionVerificationFilter === 'All' || normalizeVerificationStatus(contribution.verificationStatus) === contributionVerificationFilter;

    return matchesMember && matchesMonth && matchesStatus && matchesVerification;
  });

  const clearContributionFilters = () => {
    setContributionMemberSearch('');
    setContributionMonthFilter('All');
    setContributionStatusFilter('All');
    setContributionVerificationFilter('All');
  };

  const downloadCsvFile = (
    filename: string,
    headers: string[],
    rows: Array<Array<string | number | null | undefined>>,
    auditInfo?: { action: string; module: string; details: string }
  ) => {
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    notify(`${filename} downloaded.`, 'success');

    if (auditInfo) {
      void writeAuditLog({
        action: auditInfo.action,
        module: auditInfo.module,
        actor: actorName,
        targetName: filename,
        details: auditInfo.details,
      });
    }
  };

  const exportContributionsCsv = () => {
    if (!requireRole('Treasurer', 'export contribution reports')) return;
    const headers = ['Member Name', 'Month', 'Welfare', 'Merry Go Round', 'Insurance', 'Bereaved Family', 'Expected Amount', 'Paid Amount', 'Balance', 'Payment Status', 'Payment Date', 'Verification Status', 'Verified By', 'Verified At', 'Verification Notes'];
    const exportRows = filteredContributions.length > 0 ? filteredContributions : contributions;
    const rows = exportRows.map((contribution) => [
      contribution.memberName,
      contribution.month,
      toMoneyNumber(contribution.welfare),
      toMoneyNumber(contribution.merryGoRound),
      toMoneyNumber(contribution.insurance),
      toMoneyNumber(contribution.bereavedFamily),
      getContributionTotal(contribution),
      getContributionPaidAmount(contribution),
      getContributionBalance(contribution),
      contribution.paymentStatus,
      contribution.paymentDate,
      normalizeVerificationStatus(contribution.verificationStatus),
      contribution.verifiedBy || '',
      contribution.verifiedAt || '',
      contribution.verificationNotes || '',
    ]);

    downloadCsvFile(
      'jirani-monthly-contributions.csv',
      headers,
      rows,
      { action: 'Export Report', module: 'Reports', details: `Exported Contributions CSV with ${exportRows.length} row(s).` }
    );
  };

  const exportMemberStatementCsv = () => {
    if (!requireRole('Member', 'export member statements')) return;
    if (!statementMemberName) {
      notify('Select a member before exporting a statement.', 'warning');
      return;
    }

    const headers = ['Member Name', 'Month', 'Welfare', 'Merry Go Round', 'Insurance', 'Bereaved Family', 'Expected Amount', 'Paid Amount', 'Balance', 'Payment Status', 'Payment Date', 'Verification Status', 'Verified By', 'Verified At', 'Verification Notes'];
    const rows = statementContributions.map((contribution) => [
      contribution.memberName,
      contribution.month,
      toMoneyNumber(contribution.welfare),
      toMoneyNumber(contribution.merryGoRound),
      toMoneyNumber(contribution.insurance),
      toMoneyNumber(contribution.bereavedFamily),
      getContributionTotal(contribution),
      getContributionPaidAmount(contribution),
      getContributionBalance(contribution),
      contribution.paymentStatus,
      contribution.paymentDate,
      normalizeVerificationStatus(contribution.verificationStatus),
      contribution.verifiedBy || '',
      contribution.verifiedAt || '',
      contribution.verificationNotes || '',
    ]);

    const totalsRow = [statementMemberName, 'TOTAL', '', '', '', '', statementExpectedTotal, statementPaidTotal, statementBalanceTotal, '', '', '', '', '', ''];
    const safeMemberName = statementMemberName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'member';

    downloadCsvFile(
      `jirani-member-statement-${safeMemberName}.csv`,
      headers,
      [...rows, totalsRow],
      { action: 'Export Report', module: 'Reports', details: `Exported member statement for ${statementMemberName} with ${statementContributions.length} contribution row(s).` }
    );
  };

  const printDashboardReport = () => {
    if (!requireRole('Treasurer', 'print dashboard reports')) return;
    window.print();
    void writeAuditLog({
      action: 'Print Report',
      module: 'Reports',
      actor: actorName,
      details: 'Printed dashboard report.',
    });
  };

  const exportMembersCsv = () => {
    if (!requireRole('Admin', 'export member reports')) return;
    downloadCsvFile(
      'jirani-members-report.csv',
      ['Member Name', 'Email', 'Contact', 'Insurance Paid', 'Status', 'Join Date'],
      members.map((member) => [member.name, member.email, member.contact, member.insurancePaid, member.status, member.joinDate]),
      { action: 'Export Report', module: 'Reports', details: `Exported Members CSV with ${members.length} row(s).` }
    );
  };

  const exportArrearsCsv = () => {
    if (!requireRole('Treasurer', 'export arrears reports')) return;
    const arrearsRows = contributions.filter((contribution) => getContributionBalance(contribution) > 0);

    downloadCsvFile(
      'jirani-arrears-report.csv',
      ['Member Name', 'Month', 'Expected Amount', 'Paid Amount', 'Balance', 'Payment Status', 'Verification Status', 'Payment Date'],
      arrearsRows.map((contribution) => [
        contribution.memberName,
        contribution.month,
        getContributionTotal(contribution),
        getContributionPaidAmount(contribution),
        getContributionBalance(contribution),
        contribution.paymentStatus,
        normalizeVerificationStatus(contribution.verificationStatus),
        contribution.paymentDate,
      ]),
      { action: 'Export Report', module: 'Reports', details: `Exported Arrears CSV with ${arrearsRows.length} row(s).` }
    );
  };

  const exportVerificationCsv = () => {
    if (!requireRole('Treasurer', 'export verification reports')) return;
    downloadCsvFile(
      'jirani-payment-verification-report.csv',
      ['Member Name', 'Month', 'Expected Amount', 'Paid Amount', 'Balance', 'Payment Status', 'Verification Status', 'Verified By', 'Verified At', 'Verification Notes'],
      contributions.map((contribution) => [
        contribution.memberName,
        contribution.month,
        getContributionTotal(contribution),
        getContributionPaidAmount(contribution),
        getContributionBalance(contribution),
        contribution.paymentStatus,
        normalizeVerificationStatus(contribution.verificationStatus),
        contribution.verifiedBy || '',
        contribution.verifiedAt || '',
        contribution.verificationNotes || '',
      ]),
      { action: 'Export Report', module: 'Reports', details: `Exported Payment Verification CSV with ${contributions.length} row(s).` }
    );
  };

  const exportMerryGoRoundCsv = () => {
    if (!requireRole('Treasurer', 'export merry-go-round reports')) return;
    downloadCsvFile(
      'jirani-merry-go-round-report.csv',
      ['Round Number', 'Recipient Name', 'Payout Date', 'Payout Amount', 'Status', 'Completed At'],
      merryGoRound.map((round) => [round.roundNumber, round.recipientName, round.payoutDate, round.payoutAmount, round.status, round.completedAt || '']),
      { action: 'Export Report', module: 'Reports', details: `Exported Merry-Go-Round CSV with ${merryGoRound.length} row(s).` }
    );
  };

  const exportInsurancePoliciesCsv = () => {
    if (!requireRole('Admin', 'export insurance reports')) return;
    downloadCsvFile(
      'jirani-insurance-provider-report.csv',
      ['Provider Name', 'Policy Number', 'Month', 'Policy Start Date', 'Policy End Date', 'Premium Target', 'Provider Contribution', 'Last Respect Benefit', 'Status'],
      insurancePolicies.map((policy) => [
        policy.providerName,
        policy.policyNumber,
        policy.month,
        policy.policyStartDate,
        policy.policyEndDate,
        policy.premiumTarget,
        policy.providerContribution,
        policy.lastRespectBenefit,
        policy.status,
      ]),
      { action: 'Export Report', module: 'Reports', details: `Exported Insurance CSV with ${insurancePolicies.length} row(s).` }
    );
  };

  const exportBereavedCasesCsv = () => {
    if (!requireRole('Admin', 'export bereaved support reports')) return;
    downloadCsvFile(
      'jirani-bereaved-family-report.csv',
      ['Member Name', 'Family Contact', 'Month', 'Case Date', 'Target Amount', 'Collected Amount', 'Balance', 'Status', 'Notes'],
      bereavedCases.map((caseItem) => [
        caseItem.memberName,
        caseItem.familyContact,
        caseItem.month,
        caseItem.caseDate,
        caseItem.targetAmount,
        caseItem.collectedAmount,
        Math.max(caseItem.targetAmount - caseItem.collectedAmount, 0),
        caseItem.status,
        caseItem.notes,
      ]),
      { action: 'Export Report', module: 'Reports', details: `Exported Bereaved Cases CSV with ${bereavedCases.length} row(s).` }
    );
  };

  const exportDashboardSummaryCsv = () => {
    if (!requireRole('Treasurer', 'export dashboard summary reports')) return;
    downloadCsvFile(
      'jirani-dashboard-summary-report.csv',
      ['Metric', 'Value'],
      [
        ['Total Members', totalMembers],
        ['Member Insurance Collected', totalCollected],
        ['Pending Member Insurance Balance', totalBalancePending],
        ['Monthly Expected Contributions', totalMonthlyContributions],
        ['Monthly Paid Contributions', paidMonthlyContributions],
        ['Monthly Arrears', totalMonthlyArrears],
        ['Members With Arrears', membersWithArrears],
        ['Verified Contributions', verifiedContributionCount],
        ['Unverified Contributions', unverifiedContributionCount],
        ['Rejected Contributions', rejectedContributionCount],
        ['Insurance Provider Target', totalInsuranceTarget],
        ['Last Respect Benefit', totalLastRespectBenefit],
        ['Bereaved Target', totalBereavedTarget],
        ['Bereaved Collected', totalBereavedCollected],
        ['Audit Logs Loaded', auditLogs.length],
      ],
      { action: 'Export Report', module: 'Reports', details: 'Exported Dashboard Summary CSV.' }
    );
  };

  const exportAuditLogsCsv = () => {
    if (!requireRole('Admin', 'export audit logs')) return;
    downloadCsvFile(
      'jirani-audit-logs-report.csv',
      ['Date', 'Action', 'Module', 'Actor', 'Target Name', 'Target ID', 'Details'],
      filteredAuditLogs.map((log) => [log.createdAt, log.action, log.module, log.actor, log.targetName || '', log.targetId || '', log.details]),
      { action: 'Export Report', module: 'Reports', details: `Exported Audit Logs CSV with ${filteredAuditLogs.length} row(s).` }
    );
  };

  const statementMemberOptions: string[] = Array.from(
    new Set<string>([
      ...members.map((member) => member.name.trim()),
      ...contributions.map((contribution) => contribution.memberName.trim()),
    ].filter(Boolean))
  ).sort((firstName, secondName) => firstName.localeCompare(secondName));

  const statementContributions = statementMemberName
    ? contributions
        .filter((contribution) => contribution.memberName.trim().toLowerCase() === statementMemberName.trim().toLowerCase())
        .sort((firstContribution, secondContribution) => {
          const firstDate = firstContribution.paymentDate || firstContribution.createdAt || '';
          const secondDate = secondContribution.paymentDate || secondContribution.createdAt || '';

          return secondDate.localeCompare(firstDate);
        })
    : [];
  const statementExpectedTotal = statementContributions.reduce((sum, contribution) => sum + getContributionTotal(contribution), 0);
  const statementPaidTotal = statementContributions.reduce((sum, contribution) => sum + getContributionPaidAmount(contribution), 0);
  const statementBalanceTotal = statementContributions.reduce((sum, contribution) => sum + getContributionBalance(contribution), 0);
  const statementVerifiedCount = statementContributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Verified').length;
  const statementRejectedCount = statementContributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Rejected').length;
  const statementUnverifiedCount = statementContributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Unverified').length;

  const totalMembers = members.length;
  const totalCollected = members.filter((member) => member.status === 'Paid').reduce((sum, member) => sum + member.insurancePaid, 0);
  const totalBalancePending = members.filter((member) => member.status === 'Pending').reduce((sum, member) => sum + member.insurancePaid, 0);
  const totalMonthlyContributions = contributions.reduce((sum, contribution) => sum + getContributionTotal(contribution), 0);
  const paidMonthlyContributions = contributions.reduce((sum, contribution) => sum + getContributionPaidAmount(contribution), 0);
  const totalMonthlyArrears = contributions.reduce((sum, contribution) => sum + getContributionBalance(contribution), 0);
  const membersWithArrears = new Set(contributions.filter((contribution) => getContributionBalance(contribution) > 0).map((contribution) => contribution.memberName.trim().toLowerCase())).size;
  const filteredMonthlyContributionsTotal = filteredContributions.reduce((sum, contribution) => sum + getContributionTotal(contribution), 0);
  const filteredPaidMonthlyContributions = filteredContributions.reduce((sum, contribution) => sum + getContributionPaidAmount(contribution), 0);
  const filteredPendingMonthlyContributions = filteredContributions.reduce((sum, contribution) => sum + getContributionBalance(contribution), 0);
  const verifiedContributionCount = contributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Verified').length;
  const rejectedContributionCount = contributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Rejected').length;
  const unverifiedContributionCount = contributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Unverified').length;
  const filteredVerifiedContributionCount = filteredContributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Verified').length;
  const filteredRejectedContributionCount = filteredContributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Rejected').length;
  const filteredUnverifiedContributionCount = filteredContributions.filter((contribution) => normalizeVerificationStatus(contribution.verificationStatus) === 'Unverified').length;
  const newContributionTotal =
    toMoneyNumber(newContribution.welfare) +
    toMoneyNumber(newContribution.merryGoRound) +
    toMoneyNumber(newContribution.insurance) +
    toMoneyNumber(newContribution.bereavedFamily);
  const newContributionPaidAmount =
    newContribution.paymentStatus === 'Paid' && toMoneyNumber(newContribution.paidAmount) <= 0
      ? newContributionTotal
      : Math.min(toMoneyNumber(newContribution.paidAmount), newContributionTotal);
  const newContributionBalance = Math.max(newContributionTotal - newContributionPaidAmount, 0);
  const totalInsuranceTarget = insurancePolicies.reduce((sum, policy) => sum + policy.premiumTarget, 0);
  const totalLastRespectBenefit = insurancePolicies.reduce((sum, policy) => sum + policy.lastRespectBenefit, 0);
  const totalBereavedTarget = bereavedCases.reduce((sum, caseItem) => sum + caseItem.targetAmount, 0);
  const totalBereavedCollected = bereavedCases.reduce((sum, caseItem) => sum + caseItem.collectedAmount, 0);
  const auditModules: string[] = Array.from(new Set<string>(auditLogs.map((log) => log.module).filter(Boolean))).sort((firstModule, secondModule) => firstModule.localeCompare(secondModule));
  const normalizedAuditSearch = auditSearch.trim().toLowerCase();
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesModule = auditModuleFilter === 'All' || log.module === auditModuleFilter;
    const matchesSearch =
      normalizedAuditSearch.length === 0 ||
      log.action.toLowerCase().includes(normalizedAuditSearch) ||
      log.module.toLowerCase().includes(normalizedAuditSearch) ||
      log.actor.toLowerCase().includes(normalizedAuditSearch) ||
      (log.targetName || '').toLowerCase().includes(normalizedAuditSearch) ||
      log.details.toLowerCase().includes(normalizedAuditSearch);

    return matchesModule && matchesSearch;
  });
  const recentAuditCount = auditLogs.filter((log) => log.createdAt.slice(0, 10) === todayIso()).length;


  const normalizedRoleSearch = roleSearch.trim().toLowerCase();
  const filteredRoleMemberships = roleMemberships.filter((membership) => {
    const matchesStatus = roleStatusFilter === 'All' || membership.status === roleStatusFilter;
    const searchable = `${membership.uid} ${membership.email} ${membership.displayName} ${membership.role} ${membership.status}`.toLowerCase();
    const matchesSearch = normalizedRoleSearch.length === 0 || searchable.includes(normalizedRoleSearch);
    return matchesStatus && matchesSearch;
  });
  const activeRoleMembershipCount = roleMemberships.filter((membership) => membership.status === 'active').length;
  const adminRoleMembershipCount = roleMemberships.filter((membership) => membership.status === 'active' && membership.role === 'Admin').length + (ADMIN_EMAILS.includes(currentUser?.email?.trim().toLowerCase() || '') ? 1 : 0);
  const treasurerRoleMembershipCount = roleMemberships.filter((membership) => membership.status === 'active' && membership.role === 'Treasurer').length;
  const normalizedAccessRequestSearch = accessRequestSearch.trim().toLowerCase();
  const filteredAccessRequests = accessRequests.filter((requestItem) => {
    const matchesStatus = accessRequestStatusFilter === 'All' || requestItem.status === accessRequestStatusFilter;
    const searchable = `${requestItem.uid} ${requestItem.email} ${requestItem.displayName} ${requestItem.phone} ${requestItem.reason} ${requestItem.requestedRole} ${requestItem.status}`.toLowerCase();
    const matchesSearch = normalizedAccessRequestSearch.length === 0 || searchable.includes(normalizedAccessRequestSearch);
    return matchesStatus && matchesSearch;
  });
  const pendingAccessRequestCount = accessRequests.filter((requestItem) => requestItem.status === 'Pending').length;
  const approvedAccessRequestCount = accessRequests.filter((requestItem) => requestItem.status === 'Approved').length;
  const rejectedAccessRequestCount = accessRequests.filter((requestItem) => requestItem.status === 'Rejected').length;
  const myAccessRequest = currentUser ? accessRequests.find((requestItem) => requestItem.uid === currentUser.uid) : undefined;
  const contributionCollectionRate = totalMonthlyContributions > 0 ? Math.round((paidMonthlyContributions / totalMonthlyContributions) * 100) : 0;
  const verificationRate = contributions.length > 0 ? Math.round((verifiedContributionCount / contributions.length) * 100) : 0;
  const financeReviewCount = unverifiedContributionCount + rejectedContributionCount;
  const urgentWorkCount = (canManageMembers ? pendingAccessRequestCount : 0) + (canManageFinance ? financeReviewCount + membersWithArrears : 0);
  const lastUpdatedLabel = new Date().toLocaleString('en-KE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const chartColors = isLightTheme
    ? ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2']
    : ['#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#60a5fa'];
  const chartTextColor = isLightTheme ? '#334155' : '#cbd5e1';
  const chartGridColor = isLightTheme ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  const chartTooltipStyle = {
    backgroundColor: isLightTheme ? 'rgba(255, 255, 255, 0.96)' : 'rgba(2, 6, 23, 0.94)',
    border: `1px solid ${isLightTheme ? 'rgba(15, 23, 42, 0.14)' : 'rgba(255, 255, 255, 0.14)'}`,
    borderRadius: '18px',
    color: chartTextColor,
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.25)',
  };
  const chartTickFormatter = (value: number | string) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) return String(value);
    if (Math.abs(numericValue) >= 1000000) return `${Math.round(numericValue / 1000000)}M`;
    if (Math.abs(numericValue) >= 1000) return `${Math.round(numericValue / 1000)}K`;
    return String(numericValue);
  };
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthlyContributionChartData = Object.values(
    contributions.reduce<Record<string, { name: string; expected: number; paid: number; arrears: number; rows: number }>>((accumulator, contribution) => {
      const month = contribution.month || 'Unknown';

      if (!accumulator[month]) {
        accumulator[month] = { name: month, expected: 0, paid: 0, arrears: 0, rows: 0 };
      }

      accumulator[month].expected += getContributionTotal(contribution);
      accumulator[month].paid += getContributionPaidAmount(contribution);
      accumulator[month].arrears += getContributionBalance(contribution);
      accumulator[month].rows += 1;

      return accumulator;
    }, {})
  ).sort((firstMonth, secondMonth) => {
    const firstIndex = monthOrder.indexOf(firstMonth.name);
    const secondIndex = monthOrder.indexOf(secondMonth.name);

    if (firstIndex === -1 && secondIndex === -1) return firstMonth.name.localeCompare(secondMonth.name);
    if (firstIndex === -1) return 1;
    if (secondIndex === -1) return -1;
    return firstIndex - secondIndex;
  });
  const contributionSplitChartData = [
    { name: 'Welfare', value: contributions.reduce((sum, contribution) => sum + toMoneyNumber(contribution.welfare), 0) },
    { name: 'Merry-Go-Round', value: contributions.reduce((sum, contribution) => sum + toMoneyNumber(contribution.merryGoRound), 0) },
    { name: 'Insurance', value: contributions.reduce((sum, contribution) => sum + toMoneyNumber(contribution.insurance), 0) },
    { name: 'Bereaved Family', value: contributions.reduce((sum, contribution) => sum + toMoneyNumber(contribution.bereavedFamily), 0) },
  ].filter((item) => item.value > 0);
  const verificationChartData = [
    { name: 'Verified', value: verifiedContributionCount },
    { name: 'Unverified', value: unverifiedContributionCount },
    { name: 'Rejected', value: rejectedContributionCount },
  ].filter((item) => item.value > 0);
  const insuranceChartData = Object.values(
    insurancePolicies.reduce<Record<string, { name: string; policies: number; premium: number; benefit: number }>>((accumulator, policy) => {
      const status = policy.status || 'Unknown';

      if (!accumulator[status]) {
        accumulator[status] = { name: status, policies: 0, premium: 0, benefit: 0 };
      }

      accumulator[status].policies += 1;
      accumulator[status].premium += toMoneyNumber(policy.premiumTarget);
      accumulator[status].benefit += toMoneyNumber(policy.lastRespectBenefit);

      return accumulator;
    }, {})
  );
  const insuranceValueChartData = insurancePolicies.slice(0, 8).map((policy) => ({
    name: policy.providerName || policy.month || 'Policy',
    premium: toMoneyNumber(policy.premiumTarget),
    benefit: toMoneyNumber(policy.lastRespectBenefit),
  }));
  const bereavedChartData = bereavedCases.slice(0, 8).map((caseItem) => ({
    name: caseItem.memberName || caseItem.month || 'Case',
    target: toMoneyNumber(caseItem.targetAmount),
    collected: toMoneyNumber(caseItem.collectedAmount),
    balance: Math.max(toMoneyNumber(caseItem.targetAmount) - toMoneyNumber(caseItem.collectedAmount), 0),
  }));
  const merryGoRoundChartData = [...merryGoRound]
    .sort((firstRound, secondRound) => firstRound.roundNumber - secondRound.roundNumber)
    .slice(0, 12)
    .map((round) => ({
      name: `#${round.roundNumber}`,
      recipient: round.recipientName,
      payout: toMoneyNumber(round.payoutAmount),
    }));

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString('en-US')}`;

  if (loading || authLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.26),_transparent_38%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] px-4 text-slate-300">
        <div className="premium-surface rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl shadow-black/30 ring-1 ring-white/5 backdrop-blur-2xl">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent shadow-lg shadow-cyan-950/30" />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Loading</p>
          <p className="mt-2 text-sm font-medium text-slate-300">Preparing secured dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={`${themeShellClass} relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.28),_transparent_34%),radial-gradient(circle_at_85%_10%,_rgba(168,85,247,0.20),_transparent_35%),radial-gradient(circle_at_50%_100%,_rgba(16,185,129,0.10),_transparent_38%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)] px-3 py-3 text-slate-100 sm:px-5 lg:px-8`}>
        <style>{tableScrollbarCss}</style>
        <ToastBanner />
        <div className="pointer-events-none absolute inset-0 soft-grid-bg opacity-40" />
        <div className="pointer-events-none absolute inset-0 soft-grid-bg opacity-30" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-64 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-7xl flex-col">
          <nav className="sticky top-3 z-30 mb-5 flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-slate-950/70 px-4 py-3 shadow-2xl shadow-black/30 ring-1 ring-white/5 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] border border-cyan-300/35 bg-gradient-to-br from-cyan-300/25 to-indigo-400/20 text-sm font-black text-cyan-50 shadow-lg shadow-cyan-950/30">
                JM
              </div>
              <div>
                <p className="text-base font-black tracking-tight text-white">Jirani Mwema SHG</p>
                <p className="text-xs font-medium text-slate-300">Self Help Group Finance Portal</p>
              </div>
            </div>
            <button onClick={handleSignIn} className="w-full rounded-2xl border border-cyan-200/30 bg-gradient-to-r from-cyan-400/25 to-indigo-400/25 px-4 py-3 text-sm font-black text-cyan-50 shadow-lg shadow-cyan-950/25 backdrop-blur-xl transition hover:-translate-y-0.5 hover:from-cyan-400/35 hover:to-indigo-400/35 sm:w-auto sm:py-2" type="button">
              Member Sign In
            </button>
          </nav>

          <main className="grid flex-1 items-start gap-4 pt-3 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
            <section className="premium-surface rounded-[2rem] border border-white/10 bg-slate-950/35 p-5 shadow-2xl shadow-black/25 ring-1 ring-white/5 backdrop-blur-2xl sm:p-8 lg:rounded-[2.5rem] lg:p-10">
              <p className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">Transparent. Accountable. Member-owned.</p>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
                Jirani Mwema SHG
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base lg:text-lg lg:leading-8">
                A modern digital finance workspace for managing members, monthly contributions, merry-go-round payouts, insurance records, bereavement support, arrears, payment verification, reports, and audit logs.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={handleSignIn} className="rounded-2xl border border-cyan-200/30 bg-gradient-to-r from-cyan-400/30 to-indigo-400/30 px-6 py-3 text-center text-sm font-black text-cyan-50 shadow-lg shadow-cyan-950/25 backdrop-blur-xl transition hover:-translate-y-0.5 hover:from-cyan-400/40 hover:to-indigo-400/40" type="button">
                  Open Member Portal
                </button>
                <a href="#features" className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-center text-sm font-bold text-slate-100 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:bg-white/15">
                  View Features
                </a>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="touch-card rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-lg shadow-black/10 ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                  <p className="text-2xl font-black text-white">SHG</p>
                  <p className="mt-1 text-xs text-slate-300">Member finance management</p>
                </div>
                <div className="touch-card rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-lg shadow-black/10 ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                  <p className="text-2xl font-black text-white">Role-Based</p>
                  <p className="mt-1 text-xs text-slate-300">Admin and Treasurer controls</p>
                </div>
                <div className="touch-card rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-lg shadow-black/10 ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                  <p className="text-2xl font-black text-white">Audit Ready</p>
                  <p className="mt-1 text-xs text-slate-300">Every key action tracked</p>
                </div>
              </div>
            </section>

            <section id="features" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
              {[
                ['Monthly Contributions', 'Track welfare, merry-go-round, insurance, bereavement support, paid amounts, balances, and arrears.'],
                ['Payment Verification', 'Treasurer/Admin can verify, reject, and review member payments with notes.'],
                ['Member Statements', 'Generate individual statements with expected amounts, paid totals, arrears, and verification history.'],
                ['Access Requests', 'New users can request access and Admin can approve roles directly from the app.'],
              ].map(([title, detail]) => (
                <div key={title} className="premium-surface touch-card rounded-[1.65rem] border border-white/10 bg-slate-950/35 p-4 shadow-xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-cyan-300/25 sm:p-5">
                  <div className="mb-3 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/40" />
                  <h2 className="text-lg font-black text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                </div>
              ))}
            </section>
          </main>

          <footer className="mt-5 rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-4 text-center text-xs text-slate-400 backdrop-blur-2xl sm:mt-8">
            © {new Date().getFullYear()} Jirani Mwema SHG. Secure group finance management for registered members.
          </footer>
        </div>
      </div>
    );
  }

  if (currentUserRole === 'Guest') {
    return (
      <div className={`${themeShellClass} grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.24),_transparent_38%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] px-3 py-4 text-slate-100 sm:px-5`}>
        <style>{tableScrollbarCss}</style>
        <ToastBanner />
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Jirani Mwema SHG</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Request Access</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">You are signed in, but no active role has been assigned to this account yet. Submit this request so an Admin can approve you.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
              <p className="font-semibold text-white">{currentUser.displayName || currentUser.email}</p>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <button onClick={handleSignOut} className="mt-3 rounded-xl border border-rose-300/20 bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25" type="button">Sign Out</button>
            </div>
          </div>

          {myAccessRequest ? (
            <div className="mb-6 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
              <p className="font-bold">Current request: {myAccessRequest.status}</p>
              <p className="mt-1 text-cyan-100/80">Requested role: {myAccessRequest.requestedRole}</p>
              <p className="mt-1 text-cyan-100/80">Submitted: {myAccessRequest.createdAt ? new Date(myAccessRequest.createdAt).toLocaleString('en-KE') : 'Not recorded'}</p>
              {myAccessRequest.adminNotes ? <p className="mt-1 text-cyan-100/80">Admin note: {myAccessRequest.adminNotes}</p> : null}
            </div>
          ) : null}

          <form onSubmit={handleAccessRequestSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={accessRequestForm.displayName}
              onChange={(event) => setAccessRequestForm((previous) => ({ ...previous, displayName: event.target.value }))}
              placeholder={currentUser.displayName || 'Full name'}
              className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
            />
            <input
              value={accessRequestForm.phone}
              onChange={(event) => setAccessRequestForm((previous) => ({ ...previous, phone: event.target.value }))}
              placeholder="Phone number"
              className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
            />
            <select
              value={accessRequestForm.requestedRole}
              onChange={(event) => setAccessRequestForm((previous) => ({ ...previous, requestedRole: event.target.value as ManagedUserRole }))}
              className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
            >
              {managedRoleOptions.map((role) => (
                <option className="bg-slate-900" key={role} value={role}>{role}</option>
              ))}
            </select>
            <input
              value={currentUser.email || ''}
              disabled
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-300"
            />
            <textarea
              value={accessRequestForm.reason}
              onChange={(event) => setAccessRequestForm((previous) => ({ ...previous, reason: event.target.value }))}
              placeholder="Why do you need access? Example: I am a registered group member."
              className="min-h-28 rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none sm:col-span-2"
            />
            <button
              type="submit"
              disabled={submittingAccessRequest}
              className="rounded-2xl border border-cyan-300/20 bg-cyan-400/20 px-4 py-3 text-sm font-bold text-cyan-50 transition hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
            >
              {submittingAccessRequest ? 'Submitting Request...' : myAccessRequest?.status === 'Pending' ? 'Update Pending Request' : 'Submit Access Request'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="app-top" className={`${themeShellClass} relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_32%),radial-gradient(circle_at_80%_0%,_rgba(168,85,247,0.20),_transparent_32%),radial-gradient(circle_at_45%_100%,_rgba(16,185,129,0.08),_transparent_36%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)] px-3 py-4 text-slate-100 sm:px-5 pb-24 lg:px-8 lg:py-6`}>
      <style>{tableScrollbarCss}</style>
      <ToastBanner />
      <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-2xl focus:bg-cyan-400 focus:px-4 focus:py-3 focus:text-sm focus:font-black focus:text-slate-950">Skip to dashboard content</a>
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-64 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <header className="sticky top-3 z-30 mx-auto mb-5 flex w-full max-w-7xl flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Jirani Mwema SHG</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">Group Finance Dashboard</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1">Updated {lastUpdatedLabel}</span>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">{contributionCollectionRate}% collected</span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">{verificationRate}% verified</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
            <p className="font-semibold text-white">{currentUser.displayName || currentUser.email}</p>
            <p className="text-xs text-slate-300">Role: <span className="font-bold text-cyan-200">{currentUserRole}</span></p>
            <p className="text-xs text-slate-400">UID: <span className="font-mono">{currentUser.uid}</span></p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:justify-end">
            <button onClick={handleThemeToggle} className="rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-4 py-3 text-sm font-black text-cyan-100 shadow-lg shadow-cyan-950/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-cyan-400/25" type="button" aria-pressed={isLightTheme}>
              {isLightTheme ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button disabled={!canViewReports} onClick={exportContributionsCsv} className="rounded-2xl border border-emerald-300/25 bg-emerald-400/18 px-4 py-3 text-sm font-black text-emerald-100 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-emerald-400/28 disabled:cursor-not-allowed disabled:opacity-40" type="button">
              Export CSV
            </button>
            <button disabled={!canViewReports} onClick={printDashboardReport} className="rounded-2xl border border-white/10 bg-white/[0.09] px-4 py-3 text-sm font-black text-slate-100 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.15] disabled:cursor-not-allowed disabled:opacity-40" type="button">
              Print Report
            </button>
            <button onClick={handleSignOut} className="rounded-2xl border border-rose-300/25 bg-rose-400/15 px-4 py-3 text-sm font-black text-rose-100 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-rose-400/25" type="button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="relative z-20 mx-auto mb-5 flex w-full max-w-7xl gap-2 visible-horizontal-scrollbar overflow-x-auto overscroll-x-contain rounded-[1.4rem] border border-white/10 bg-slate-950/45 p-2 pb-4 text-xs font-bold text-slate-200 shadow-xl shadow-black/20 backdrop-blur-2xl sm:text-sm" aria-label="Dashboard sections">
        {[
          'Access Control',
          'Settings',
          canManageMembers ? 'Role Management' : '',
          canManageMembers ? 'Access Requests' : '',
          'Stats',
          'Charts & Analytics',
          'Monthly Contributors',
          'Member Statement',
          'Reports & Exports',
          'Audit Logs',
          canManageMembers ? 'Member Tracker' : '',
        ].filter(Boolean).map((item) => (
          <a key={item} href={`#${String(item).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-400/10">
            {item}
          </a>
        ))}
      </nav>

      <section className="premium-surface relative z-10 mx-auto mb-6 w-full max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/40 p-3 shadow-2xl shadow-black/25 ring-1 ring-white/5 backdrop-blur-2xl sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Today&apos;s workflow</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
              {urgentWorkCount > 0 ? `${urgentWorkCount} item(s) need attention` : 'Everything important is under control'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Start with access approvals, payment reviews, and arrears before exporting reports.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4 lg:min-w-[520px]">
            {canManageMembers ? (
              <a href="#access-requests" className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3 transition hover:bg-amber-400/15">
                <p className="text-2xl font-black text-amber-200">{pendingAccessRequestCount}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100/80">Access</p>
              </a>
            ) : null}
            {canManageFinance ? (
              <a href="#monthly-contributors" className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 transition hover:bg-cyan-400/15">
                <p className="text-2xl font-black text-cyan-200">{financeReviewCount}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100/80">Reviews</p>
              </a>
            ) : null}
            {canManageFinance ? (
              <a href="#member-statement" className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 transition hover:bg-rose-400/15">
                <p className="text-2xl font-black text-rose-200">{membersWithArrears}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-100/80">Arrears</p>
              </a>
            ) : null}
            <a href="#audit-logs" className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 transition hover:bg-white/[0.12]">
              <p className="text-2xl font-black text-white">{recentAuditCount}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Today</p>
            </a>
          </div>
        </div>
      </section>

      <main id="dashboard-content" className="relative mx-auto w-full max-w-7xl">
        <Module
          title="Access Control"
          content={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Signed In As" value={currentUserRole} detail={currentUser.email || 'Google account'} />
              <StatCard title="Member Records" value={canManageMembers ? 'Editable' : 'Locked'} detail="Admin access required" />
              <StatCard title="Finance Records" value={canManageFinance ? 'Editable' : 'Locked'} detail="Treasurer or Admin access required" />
              <StatCard title="Reports" value={canViewReports ? 'Enabled' : 'Restricted'} detail="Treasurer or Admin access required" />
            </div>
          }
        />

        <Module
          title="Settings"
          content={
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/10">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Appearance</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-white">Light / Dark Mode</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Change the app theme for this browser. Your selection is saved locally and will be remembered when you reopen the app.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-black/20 p-2">
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                      themeMode === 'dark'
                        ? 'border border-cyan-300/35 bg-cyan-400/20 text-cyan-50 shadow-lg shadow-cyan-950/20'
                        : 'border border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/[0.12]'
                    }`}
                    aria-pressed={themeMode === 'dark'}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                      themeMode === 'light'
                        ? 'border border-cyan-300/35 bg-cyan-400/20 text-cyan-50 shadow-lg shadow-cyan-950/20'
                        : 'border border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/[0.12]'
                    }`}
                    aria-pressed={themeMode === 'light'}
                  >
                    Light
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/10">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Current session</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Theme</p>
                    <p className="mt-1 text-lg font-black text-white">{isLightTheme ? 'Light' : 'Dark'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Role</p>
                    <p className="mt-1 text-lg font-black text-white">{currentUserRole}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Saved</p>
                    <p className="mt-1 text-lg font-black text-white">Browser</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className="mt-4 w-full rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-4 py-3 text-sm font-black text-cyan-100 shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-400/25"
                >
                  Switch to {isLightTheme ? 'Dark' : 'Light'} Mode
                </button>
              </div>
            </div>
          }
        />

        {canManageMembers ? (
          <Module
            title="Role Management"
            content={
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard title="Active Users" value={activeRoleMembershipCount} detail="Role documents with active status" />
                  <StatCard title="Admins" value={adminRoleMembershipCount} detail="Includes bootstrap admin email" />
                  <StatCard title="Treasurers" value={treasurerRoleMembershipCount} detail="Finance access users" />
                  <StatCard title="Current UID" value="Copy from header" detail="Use Firebase Auth UID when adding users" />
                </div>

                <form onSubmit={handleRoleMembershipSubmit} className="grid grid-cols-1 gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 sm:grid-cols-2 xl:grid-cols-6">
                  <input
                    value={newRoleMember.uid}
                    onChange={(event) => setNewRoleMember((previous) => ({ ...previous, uid: event.target.value }))}
                    placeholder="Firebase Auth UID"
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none sm:col-span-2"
                  />
                  <input
                    value={newRoleMember.email}
                    onChange={(event) => setNewRoleMember((previous) => ({ ...previous, email: event.target.value }))}
                    placeholder="User email"
                    type="email"
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none sm:col-span-2"
                  />
                  <input
                    value={newRoleMember.displayName}
                    onChange={(event) => setNewRoleMember((previous) => ({ ...previous, displayName: event.target.value }))}
                    placeholder="Display name"
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none sm:col-span-2"
                  />
                  <select
                    value={newRoleMember.role}
                    onChange={(event) => setNewRoleMember((previous) => ({ ...previous, role: event.target.value as ManagedUserRole }))}
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {managedRoleOptions.map((role) => (
                      <option className="bg-slate-900" key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <select
                    value={newRoleMember.status}
                    onChange={(event) => setNewRoleMember((previous) => ({ ...previous, status: event.target.value as MembershipStatus }))}
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {membershipStatusOptions.map((status) => (
                      <option className="bg-slate-900" key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleCurrentUserRoleBootstrap}
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.13]"
                  >
                    Use My UID
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRoleMember}
                    className="rounded-2xl border border-cyan-300/20 bg-cyan-400/20 px-4 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-3"
                  >
                    {submittingRoleMember ? 'Saving Role...' : 'Save Role Access'}
                  </button>
                </form>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input
                    type="search"
                    value={roleSearch}
                    onChange={(event) => setRoleSearch(event.target.value)}
                    placeholder="Search UID, email, name, role..."
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none sm:col-span-2"
                  />
                  <select
                    value={roleStatusFilter}
                    onChange={(event) => setRoleStatusFilter(event.target.value as 'All' | MembershipStatus)}
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option className="bg-slate-900" value="All">All statuses</option>
                    {membershipStatusOptions.map((status) => (
                      <option className="bg-slate-900" key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
                  <div className="table-scroll-hint sm:hidden">Swipe table ↔</div>
                  <table className="min-w-[760px] divide-y divide-white/10 text-sm">
                    <thead className="text-left text-xs uppercase tracking-[0.16em] text-slate-400">
                      <tr>
                        <th className="px-3 py-3">User</th>
                        <th className="px-3 py-3">UID</th>
                        <th className="px-3 py-3">Role</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Updated</th>
                        <th className="px-3 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredRoleMemberships.map((membership) => (
                        <tr key={membership.uid} className="transition hover:bg-white/[0.04]">
                          <td className="px-3 py-3">
                            <p className="font-semibold text-white">{membership.displayName || membership.email || 'Unnamed user'}</p>
                            <p className="text-xs text-slate-400">{membership.email || 'No email saved'}</p>
                          </td>
                          <td className="max-w-[220px] truncate px-3 py-3 font-mono text-xs text-slate-300" title={membership.uid}>{membership.uid}</td>
                          <td className="px-3 py-3">
                            <select
                              value={membership.role}
                              onChange={(event) => handleRoleChange(membership, event.target.value as ManagedUserRole)}
                              className="rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white focus:border-cyan-400 focus:outline-none"
                            >
                              {managedRoleOptions.map((role) => (
                                <option className="bg-slate-900" key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <select
                              value={membership.status}
                              onChange={(event) => handleRoleStatusChange(membership, event.target.value as MembershipStatus)}
                              className="rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white focus:border-cyan-400 focus:outline-none"
                            >
                              {membershipStatusOptions.map((status) => (
                                <option className="bg-slate-900" key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-400">{membership.updatedAt ? new Date(membership.updatedAt).toLocaleString('en-KE') : 'Not set'}</td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteRoleMembership(membership)}
                              className="rounded-xl border border-rose-300/20 bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredRoleMemberships.length === 0 ? (
                    <p className="px-3 py-5 text-center text-sm text-slate-400">No role records match the current filters.</p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-50">
                  <p className="font-semibold">How to add another user</p>
                  <p className="mt-1 text-amber-100/80">Users can now sign in and submit an Access Request. Admins can approve them from the Access Requests module without copying Firebase UIDs manually.</p>
                </div>
              </div>
            }
          />
        ) : null}

        {canManageMembers ? (
          <Module
            title="Access Requests"
            content={
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard title="Pending Requests" value={pendingAccessRequestCount} detail="Awaiting Admin approval" />
                  <StatCard title="Approved Requests" value={approvedAccessRequestCount} detail="Converted to active roles" />
                  <StatCard title="Rejected Requests" value={rejectedAccessRequestCount} detail="Declined access requests" />
                  <StatCard title="Visible Requests" value={filteredAccessRequests.length} detail="After current filters" />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input
                    type="search"
                    value={accessRequestSearch}
                    onChange={(event) => setAccessRequestSearch(event.target.value)}
                    placeholder="Search name, email, phone, reason..."
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none sm:col-span-2"
                  />
                  <select
                    value={accessRequestStatusFilter}
                    onChange={(event) => setAccessRequestStatusFilter(event.target.value as 'All' | AccessRequestStatus)}
                    className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option className="bg-slate-900" value="All">All request statuses</option>
                    <option className="bg-slate-900" value="Pending">Pending</option>
                    <option className="bg-slate-900" value="Approved">Approved</option>
                    <option className="bg-slate-900" value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
                  <div className="table-scroll-hint sm:hidden">Swipe table ↔</div>
                  <table className="min-w-[760px] divide-y divide-white/10 text-sm">
                    <thead className="text-left text-xs uppercase tracking-[0.16em] text-slate-400">
                      <tr>
                        <th className="px-3 py-3">Requester</th>
                        <th className="px-3 py-3">Requested Role</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Reason</th>
                        <th className="px-3 py-3">Approve As</th>
                        <th className="px-3 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredAccessRequests.map((requestItem) => (
                        <tr key={requestItem.id} className="transition hover:bg-white/[0.04]">
                          <td className="px-3 py-3">
                            <p className="font-semibold text-white">{requestItem.displayName || requestItem.email || 'Unnamed requester'}</p>
                            <p className="text-xs text-slate-400">{requestItem.email || 'No email'} • {requestItem.phone || 'No phone'}</p>
                            <p className="max-w-[220px] truncate font-mono text-[11px] text-slate-500" title={requestItem.uid}>{requestItem.uid}</p>
                          </td>
                          <td className="px-3 py-3 text-slate-200">{requestItem.requestedRole}</td>
                          <td className="px-3 py-3"><span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold text-slate-100">{requestItem.status}</span></td>
                          <td className="max-w-[300px] px-3 py-3 text-slate-300">{requestItem.reason}</td>
                          <td className="px-3 py-3">
                            <select
                              value={accessApprovalRoles[requestItem.id] || requestItem.requestedRole || 'Member'}
                              onChange={(event) => setAccessApprovalRoles((previous) => ({ ...previous, [requestItem.id]: event.target.value as ManagedUserRole }))}
                              disabled={requestItem.status !== 'Pending'}
                              className="rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white focus:border-cyan-400 focus:outline-none disabled:opacity-50"
                            >
                              {managedRoleOptions.map((role) => (
                                <option className="bg-slate-900" key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleApproveAccessRequest(requestItem)}
                                disabled={requestItem.status !== 'Pending' || processingAccessRequestId === requestItem.id}
                                className="rounded-xl border border-emerald-300/20 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectAccessRequest(requestItem)}
                                disabled={requestItem.status !== 'Pending' || processingAccessRequestId === requestItem.id}
                                className="rounded-xl border border-rose-300/20 bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAccessRequests.length === 0 ? (
                    <p className="px-3 py-5 text-center text-sm text-slate-400">No access requests match the current filters.</p>
                  ) : null}
                </div>
              </div>
            }
          />
        ) : null}

        <Module
          title="Stats"
          content={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
              <StatCard title="Total Members" value={totalMembers} detail="From database records" />
              <StatCard title="Member Insurance" value={formatCurrency(totalCollected)} detail="Completed member insurance" />
              <StatCard title="Pending Balance" value={formatCurrency(totalBalancePending)} detail="Still pending collection" />
              <StatCard title="Monthly Contributions" value={formatCurrency(totalMonthlyContributions)} detail={`Paid: ${formatCurrency(paidMonthlyContributions)}`} />
              <StatCard title="Monthly Arrears" value={formatCurrency(totalMonthlyArrears)} detail={`${membersWithArrears} member(s) with balance`} />
              <StatCard title="Payment Verification" value={verifiedContributionCount} detail={`${unverifiedContributionCount} unverified • ${rejectedContributionCount} rejected`} />
              <StatCard title="Insurance Target" value={formatCurrency(totalInsuranceTarget)} detail={`Benefit: ${formatCurrency(totalLastRespectBenefit)}`} />
              <StatCard title="Bereaved Support" value={formatCurrency(totalBereavedCollected)} detail={`Target: ${formatCurrency(totalBereavedTarget)}`} />
            </div>
          }
        />

        <Module
          title="Charts & Analytics"
          content={
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ChartPanel title="Monthly Contributions Trend" detail="Expected collection, actual paid amount, and arrears by month.">
                  {monthlyContributionChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyContributionChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors[1]} stopOpacity={0.7} />
                            <stop offset="95%" stopColor={chartColors[1]} stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="arrearsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors[3]} stopOpacity={0.55} />
                            <stop offset="95%" stopColor={chartColors[3]} stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} tickFormatter={chartTickFormatter} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: chartTextColor, fontWeight: 800 }} />
                        <Legend wrapperStyle={{ color: chartTextColor, fontSize: 12 }} />
                        <Area type="monotone" dataKey="paid" name="Paid" stroke={chartColors[1]} fill="url(#paidGradient)" strokeWidth={3} />
                        <Area type="monotone" dataKey="arrears" name="Arrears" stroke={chartColors[3]} fill="url(#arrearsGradient)" strokeWidth={3} />
                        <Bar dataKey="expected" name="Expected" fill={chartColors[0]} radius={[8, 8, 0, 0]} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-sm text-slate-400">No contribution data yet.</div>
                  )}
                </ChartPanel>

                <ChartPanel title="Contribution Split" detail="Breakdown by welfare, merry-go-round, insurance, and bereaved support.">
                  {contributionSplitChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={contributionSplitChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                          {contributionSplitChartData.map((entry, index) => (
                            <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: chartTextColor, fontWeight: 800 }} />
                        <Legend wrapperStyle={{ color: chartTextColor, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-sm text-slate-400">No contribution split data yet.</div>
                  )}
                </ChartPanel>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <ChartPanel title="Payment Verification" detail="Verified, unverified, and rejected contribution rows.">
                  {verificationChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={verificationChartData} dataKey="value" nameKey="name" outerRadius={92} label>
                          {verificationChartData.map((entry, index) => (
                            <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: chartTextColor, fontWeight: 800 }} />
                        <Legend wrapperStyle={{ color: chartTextColor, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-sm text-slate-400">No verification data yet.</div>
                  )}
                </ChartPanel>

                <ChartPanel title="Insurance Status" detail="Insurance policy count by status.">
                  {insuranceChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insuranceChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: chartTextColor, fontWeight: 800 }} />
                        <Bar dataKey="policies" name="Policies" fill={chartColors[0]} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-sm text-slate-400">No insurance policies yet.</div>
                  )}
                </ChartPanel>

                <ChartPanel title="Merry-Go-Round Payouts" detail="Scheduled payout amounts by round.">
                  {merryGoRoundChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={merryGoRoundChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} tickFormatter={chartTickFormatter} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: chartTextColor, fontWeight: 800 }} />
                        <Bar dataKey="payout" name="Payout" fill={chartColors[4]} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-sm text-slate-400">No merry-go-round rounds yet.</div>
                  )}
                </ChartPanel>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ChartPanel title="Insurance Premium vs Benefit" detail="Compares premium target and last respect benefit for recent policies.">
                  {insuranceValueChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insuranceValueChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} tickFormatter={chartTickFormatter} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: chartTextColor, fontWeight: 800 }} />
                        <Legend wrapperStyle={{ color: chartTextColor, fontSize: 12 }} />
                        <Bar dataKey="premium" name="Premium Target" fill={chartColors[0]} radius={[8, 8, 0, 0]} />
                        <Bar dataKey="benefit" name="Last Respect Benefit" fill={chartColors[1]} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-sm text-slate-400">No insurance value data yet.</div>
                  )}
                </ChartPanel>

                <ChartPanel title="Bereaved Support Collection" detail="Target, collected amount, and outstanding balance for recent cases.">
                  {bereavedChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bereavedChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} tickFormatter={chartTickFormatter} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: chartTextColor, fontWeight: 800 }} />
                        <Legend wrapperStyle={{ color: chartTextColor, fontSize: 12 }} />
                        <Bar dataKey="target" name="Target" fill={chartColors[0]} radius={[8, 8, 0, 0]} />
                        <Bar dataKey="collected" name="Collected" fill={chartColors[1]} radius={[8, 8, 0, 0]} />
                        <Bar dataKey="balance" name="Balance" fill={chartColors[3]} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-center text-sm text-slate-400">No bereaved support cases yet.</div>
                  )}
                </ChartPanel>
              </div>
            </div>
          }
        />

        <Module
          title="Reports & Exports"
          content={
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Expected Collection</p>
                  <p className="mt-2 text-2xl font-black text-emerald-300">{formatCurrency(totalMonthlyContributions)}</p>
                  <p className="mt-1 text-xs text-slate-400">From all monthly contribution rows</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Paid Collection</p>
                  <p className="mt-2 text-2xl font-black text-cyan-300">{formatCurrency(paidMonthlyContributions)}</p>
                  <p className="mt-1 text-xs text-slate-400">Actual paid amount recorded</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Arrears Exposure</p>
                  <p className="mt-2 text-2xl font-black text-amber-300">{formatCurrency(totalMonthlyArrears)}</p>
                  <p className="mt-1 text-xs text-slate-400">{membersWithArrears} member(s) have outstanding balances</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Verification Review</p>
                  <p className="mt-2 text-2xl font-black text-rose-300">{unverifiedContributionCount + rejectedContributionCount}</p>
                  <p className="mt-1 text-xs text-slate-400">Unverified plus rejected payment rows</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <button type="button" onClick={exportDashboardSummaryCsv} className="rounded-2xl border border-cyan-300/20 bg-cyan-400/20 px-4 py-3 text-left text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/30">
                  Dashboard Summary CSV
                  <span className="mt-1 block text-xs font-normal text-cyan-100/75">Overall financial summary</span>
                </button>
                <button type="button" onClick={exportContributionsCsv} className="rounded-2xl border border-emerald-300/20 bg-emerald-400/20 px-4 py-3 text-left text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400/30">
                  Contributions CSV
                  <span className="mt-1 block text-xs font-normal text-emerald-100/75">Uses current contribution filters</span>
                </button>
                <button type="button" onClick={exportArrearsCsv} className="rounded-2xl border border-amber-300/20 bg-amber-400/20 px-4 py-3 text-left text-sm font-semibold text-amber-50 transition hover:bg-amber-400/30">
                  Arrears CSV
                  <span className="mt-1 block text-xs font-normal text-amber-100/75">Only members with outstanding balance</span>
                </button>
                <button type="button" onClick={exportVerificationCsv} className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/20 px-4 py-3 text-left text-sm font-semibold text-fuchsia-50 transition hover:bg-fuchsia-400/30">
                  Verification CSV
                  <span className="mt-1 block text-xs font-normal text-fuchsia-100/75">Verified, unverified, and rejected rows</span>
                </button>
                <button type="button" onClick={exportMembersCsv} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.13]">
                  Members CSV
                  <span className="mt-1 block text-xs font-normal text-slate-300">Member contacts and insurance status</span>
                </button>
                <button type="button" onClick={exportMerryGoRoundCsv} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.13]">
                  Merry-Go-Round CSV
                  <span className="mt-1 block text-xs font-normal text-slate-300">Round schedule and payouts</span>
                </button>
                <button type="button" onClick={exportInsurancePoliciesCsv} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.13]">
                  Insurance CSV
                  <span className="mt-1 block text-xs font-normal text-slate-300">Provider policies and benefits</span>
                </button>
                <button type="button" onClick={exportBereavedCasesCsv} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.13]">
                  Bereaved Cases CSV
                  <span className="mt-1 block text-xs font-normal text-slate-300">Family support targets and collections</span>
                </button>
                <button type="button" onClick={exportAuditLogsCsv} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.13]">
                  Audit Logs CSV
                  <span className="mt-1 block text-xs font-normal text-slate-300">Action history and verification trail</span>
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Report note</p>
                <p className="mt-1">The Contributions CSV respects the active Monthly Contributors filters. Other exports use their full module records.</p>
              </div>
            </div>
          }
        />

        <Module
          title="Audit Logs"
          content={
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Total Logs</p>
                  <p className="mt-2 text-2xl font-black text-white">{auditLogs.length}</p>
                  <p className="mt-1 text-xs text-slate-400">Latest 100 audit records loaded</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Today</p>
                  <p className="mt-2 text-2xl font-black text-cyan-300">{recentAuditCount}</p>
                  <p className="mt-1 text-xs text-slate-400">Actions recorded today</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Filtered</p>
                  <p className="mt-2 text-2xl font-black text-emerald-300">{filteredAuditLogs.length}</p>
                  <p className="mt-1 text-xs text-slate-400">Rows matching current filters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input
                  type="search"
                  value={auditSearch}
                  onChange={(event) => setAuditSearch(event.target.value)}
                  placeholder="Search action, member, module, note..."
                  className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                />
                <select
                  value={auditModuleFilter}
                  onChange={(event) => setAuditModuleFilter(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option className="bg-slate-900" value="All">All modules</option>
                  {auditModules.map((moduleName) => (
                    <option className="bg-slate-900" key={moduleName} value={moduleName}>{moduleName}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setAuditSearch(''); setAuditModuleFilter('All'); }} className="flex-1 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.13]">
                    Clear
                  </button>
                  <button type="button" onClick={exportAuditLogsCsv} className="flex-1 rounded-2xl border border-emerald-300/20 bg-emerald-400/20 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400/30">
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
                <div className="table-scroll-hint sm:hidden">Swipe table ↔</div>
                <table className="min-w-[760px] divide-y divide-white/10 text-sm">
                  <thead className="text-left text-xs uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Action</th>
                      <th className="px-3 py-3">Module</th>
                      <th className="px-3 py-3">Actor</th>
                      <th className="px-3 py-3">Target</th>
                      <th className="px-3 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredAuditLogs.slice(0, 25).map((log) => (
                      <tr key={log.id} className="transition hover:bg-white/[0.04]">
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-300">{new Date(log.createdAt).toLocaleString('en-KE')}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-white">{log.action}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-cyan-200">{log.module}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-slate-300">{log.actor}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-slate-300">{log.targetName || log.targetId || '—'}</td>
                        <td className="min-w-[280px] px-3 py-3 text-slate-300">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAuditLogs.length === 0 ? (
                  <p className="px-3 py-5 text-center text-sm text-slate-400">No audit log records match the current filters.</p>
                ) : null}
              </div>

              <p className="text-xs text-slate-400">Audit logs are stored in Firestore at groups/{CURRENT_GROUP_ID}/auditLogs. New actions are recorded from this dashboard going forward.</p>
            </div>
          }
        />

        <div className="mb-8 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2">
          <Module
            title="Monthly Contributors"
            content={
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 md:grid-cols-5">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Search Member</label>
                    <input
                      type="search"
                      value={contributionMemberSearch}
                      onChange={(event) => setContributionMemberSearch(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                      placeholder="Type member name..."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Month</label>
                    <select
                      value={contributionMonthFilter}
                      onChange={(event) => setContributionMonthFilter(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    >
                      <option value="All">All months</option>
                      {availableContributionMonths.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</label>
                    <select
                      value={contributionStatusFilter}
                      onChange={(event) => setContributionStatusFilter(event.target.value as 'All' | PaymentStatus)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    >
                      <option value="All">All statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Verification</label>
                    <select
                      value={contributionVerificationFilter}
                      onChange={(event) => setContributionVerificationFilter(event.target.value as 'All' | VerificationStatus)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    >
                      <option value="All">All verification</option>
                      <option value="Unverified">Unverified</option>
                      <option value="Verified">Verified</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearContributionFilters}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:grid-cols-7">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Rows Shown</p>
                    <p className="mt-1 text-xl font-black text-white">{filteredContributions.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Filtered Total</p>
                    <p className="mt-1 text-xl font-black text-emerald-300">{formatCurrency(filteredMonthlyContributionsTotal)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Filtered Paid</p>
                    <p className="mt-1 text-xl font-black text-cyan-300">{formatCurrency(filteredPaidMonthlyContributions)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Filtered Arrears</p>
                    <p className="mt-1 text-xl font-black text-amber-300">{formatCurrency(filteredPendingMonthlyContributions)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Verified</p>
                    <p className="mt-1 text-xl font-black text-emerald-300">{filteredVerifiedContributionCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Unverified</p>
                    <p className="mt-1 text-xl font-black text-slate-200">{filteredUnverifiedContributionCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Rejected</p>
                    <p className="mt-1 text-xl font-black text-rose-300">{filteredRejectedContributionCount}</p>
                  </div>
                </div>

                <div className="visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
                  <div className="table-scroll-hint sm:hidden">Swipe table ↔</div>
                  <table className="min-w-[880px] divide-y divide-white/10 overflow-hidden text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Member</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Month</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Welfare</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">MGR</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Insurance</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Bereaved</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Expected</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Verification</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Verifier</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Notes</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredContributions.map((contribution) => {
                      const isEditingContribution = editingContributionId === contribution.id;
                      const editingTotal =
                        toMoneyNumber(contributionEditForm.welfare) +
                        toMoneyNumber(contributionEditForm.merryGoRound) +
                        toMoneyNumber(contributionEditForm.insurance) +
                        toMoneyNumber(contributionEditForm.bereavedFamily);
                      const editingPaidAmount = contributionEditForm.paymentStatus === 'Paid' && toMoneyNumber(contributionEditForm.paidAmount) <= 0
                        ? editingTotal
                        : Math.min(toMoneyNumber(contributionEditForm.paidAmount), editingTotal);
                      const editingBalance = Math.max(editingTotal - editingPaidAmount, 0);
                      const verificationStatus = normalizeVerificationStatus(contribution.verificationStatus);

                      return (
                        <tr key={contribution.id} className="transition-colors hover:bg-white/[0.04]">
                          <td className="px-4 py-3 font-medium text-white">
                            {isEditingContribution ? (
                              <input
                                name="memberName"
                                type="text"
                                value={contributionEditForm.memberName}
                                onChange={handleContributionEditChange}
                                className="w-44 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              />
                            ) : (
                              contribution.memberName
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {isEditingContribution ? (
                              <input
                                name="month"
                                type="text"
                                value={contributionEditForm.month}
                                onChange={handleContributionEditChange}
                                className="w-28 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              />
                            ) : (
                              contribution.month
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {isEditingContribution ? (
                              <input
                                name="paymentDate"
                                type="date"
                                value={contributionEditForm.paymentDate}
                                onChange={handleContributionEditChange}
                                className="w-36 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              />
                            ) : (
                              formatCalendarDate(contribution.paymentDate)
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {isEditingContribution ? (
                              <input
                                name="welfare"
                                type="number"
                                min="0"
                                value={contributionEditForm.welfare}
                                onChange={handleContributionEditChange}
                                className="w-24 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              />
                            ) : (
                              formatCurrency(toMoneyNumber(contribution.welfare))
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {isEditingContribution ? (
                              <input
                                name="merryGoRound"
                                type="number"
                                min="0"
                                value={contributionEditForm.merryGoRound}
                                onChange={handleContributionEditChange}
                                className="w-24 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              />
                            ) : (
                              formatCurrency(toMoneyNumber(contribution.merryGoRound))
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {isEditingContribution ? (
                              <input
                                name="insurance"
                                type="number"
                                min="0"
                                value={contributionEditForm.insurance}
                                onChange={handleContributionEditChange}
                                className="w-24 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              />
                            ) : (
                              formatCurrency(toMoneyNumber(contribution.insurance))
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {isEditingContribution ? (
                              <input
                                name="bereavedFamily"
                                type="number"
                                min="0"
                                value={contributionEditForm.bereavedFamily}
                                onChange={handleContributionEditChange}
                                className="w-24 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              />
                            ) : (
                              formatCurrency(toMoneyNumber(contribution.bereavedFamily))
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-emerald-300">
                            {formatCurrency(isEditingContribution ? editingTotal : getContributionTotal(contribution))}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-cyan-300">
                            {isEditingContribution ? (
                              <input
                                name="paidAmount"
                                type="number"
                                min="0"
                                value={contributionEditForm.paidAmount}
                                onChange={handleContributionEditChange}
                                className="w-24 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              />
                            ) : (
                              formatCurrency(getContributionPaidAmount(contribution))
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-rose-300">
                            {formatCurrency(isEditingContribution ? editingBalance : getContributionBalance(contribution))}
                          </td>
                          <td className="px-4 py-3">
                            {isEditingContribution ? (
                              <select
                                name="paymentStatus"
                                value={contributionEditForm.paymentStatus}
                                onChange={handleContributionEditChange}
                                className="rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white outline-none focus:border-cyan-300/60"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                              </select>
                            ) : (
                              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${contribution.paymentStatus === 'Paid' ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-300' : 'border-amber-300/20 bg-amber-400/10 text-amber-300'}`}>
                                {contribution.paymentStatus}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                verificationStatus === 'Verified'
                                  ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-300'
                                  : verificationStatus === 'Rejected'
                                    ? 'border-rose-300/20 bg-rose-400/10 text-rose-300'
                                    : 'border-slate-300/20 bg-slate-400/10 text-slate-300'
                              }`}
                            >
                              {verificationStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300">
                            {contribution.verifiedBy || '—'}
                            {contribution.verifiedAt ? (
                              <span className="block text-[11px] text-slate-500">{new Date(contribution.verifiedAt).toLocaleDateString('en-KE')}</span>
                            ) : null}
                          </td>
                          <td className="max-w-[14rem] px-4 py-3 text-xs text-slate-400">
                            <span className="line-clamp-2">{contribution.verificationNotes || '—'}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isEditingContribution ? (
                              <div className="flex justify-end gap-3">
                                <button onClick={() => saveContributionChanges(contribution.id)} className="text-xs font-semibold text-emerald-400 underline hover:text-emerald-300" type="button">
                                  Save
                                </button>
                                <button onClick={cancelContributionEditing} className="text-xs font-semibold text-slate-300 underline hover:text-white" type="button">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap justify-end gap-3">
                                <button onClick={() => startEditingContribution(contribution)} className="text-xs font-semibold text-cyan-400 underline hover:text-cyan-300" type="button">
                                  Edit
                                </button>
                                <button
                                  onClick={() => markContributionStatus(contribution.id, contribution.paymentStatus === 'Paid' ? 'Pending' : 'Paid')}
                                  className="text-xs font-semibold text-emerald-400 underline hover:text-emerald-300"
                                  type="button"
                                >
                                  {contribution.paymentStatus === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                                </button>
                                <button onClick={() => updateContributionVerification(contribution.id, 'Verified')} className="text-xs font-semibold text-emerald-300 underline hover:text-emerald-200" type="button">
                                  Verify
                                </button>
                                <button onClick={() => updateContributionVerification(contribution.id, 'Rejected')} className="text-xs font-semibold text-amber-300 underline hover:text-amber-200" type="button">
                                  Reject
                                </button>
                                {verificationStatus !== 'Unverified' ? (
                                  <button onClick={() => updateContributionVerification(contribution.id, 'Unverified')} className="text-xs font-semibold text-slate-300 underline hover:text-white" type="button">
                                    Reset
                                  </button>
                                ) : null}
                                <button onClick={() => handleDeleteContribution(contribution.id)} className="text-xs font-semibold text-rose-400 underline hover:text-rose-300" type="button">
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredContributions.length === 0 && (
                      <tr><td colSpan={15} className="px-4 py-6 text-center text-sm text-slate-400">No monthly contributors match the current filters.</td></tr>
                    )}
                  </tbody>
                  </table>
                </div>
              </div>
            }
          />

          <div className="lg:col-span-2">
            <Module
              title="Member Statement"
              content={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Select Member</label>
                      <select
                        value={statementMemberName}
                        onChange={(event) => setStatementMemberName(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                      >
                        <option value="">Choose member...</option>
                        {statementMemberOptions.map((memberName) => (
                          <option key={memberName} value={memberName}>
                            {memberName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={exportMemberStatementCsv}
                      disabled={!statementMemberName || statementContributions.length === 0}
                      className="rounded-2xl border border-emerald-300/20 bg-emerald-400/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Export Statement CSV
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Rows</p>
                      <p className="mt-1 text-xl font-black text-white">{statementContributions.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Expected</p>
                      <p className="mt-1 text-xl font-black text-emerald-300">{formatCurrency(statementExpectedTotal)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Paid</p>
                      <p className="mt-1 text-xl font-black text-cyan-300">{formatCurrency(statementPaidTotal)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Arrears</p>
                      <p className="mt-1 text-xl font-black text-amber-300">{formatCurrency(statementBalanceTotal)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Verified</p>
                      <p className="mt-1 text-xl font-black text-emerald-300">{statementVerifiedCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Review</p>
                      <p className="mt-1 text-xl font-black text-slate-200">{statementUnverifiedCount + statementRejectedCount}</p>
                    </div>
                  </div>

                  <div className="visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
                    <div className="table-scroll-hint sm:hidden">Swipe table ↔</div>
                    <table className="min-w-[880px] divide-y divide-white/10 overflow-hidden text-sm">
                      <thead className="bg-white/[0.05]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Month</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Payment Date</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Expected</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Paid</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Arrears</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Payment</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Verification</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10/50 [&_tr:hover]:bg-white/[0.035]">
                        {statementContributions.map((contribution) => {
                          const verificationStatus = normalizeVerificationStatus(contribution.verificationStatus);

                          return (
                            <tr key={contribution.id} className="transition hover:bg-white/[0.04]">
                              <td className="px-4 py-3 text-sm font-semibold text-white">{contribution.month}</td>
                              <td className="px-4 py-3 text-sm text-slate-300">{formatCalendarDate(contribution.paymentDate)}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-emerald-300">{formatCurrency(getContributionTotal(contribution))}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-cyan-300">{formatCurrency(getContributionPaidAmount(contribution))}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-amber-300">{formatCurrency(getContributionBalance(contribution))}</td>
                              <td className="px-4 py-3">
                                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${contribution.paymentStatus === 'Paid' ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-300' : 'border-amber-300/20 bg-amber-400/10 text-amber-300'}`}>
                                  {contribution.paymentStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                    verificationStatus === 'Verified'
                                      ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-300'
                                      : verificationStatus === 'Rejected'
                                        ? 'border-rose-300/20 bg-rose-400/10 text-rose-300'
                                        : 'border-slate-300/20 bg-slate-400/10 text-slate-300'
                                  }`}
                                >
                                  {verificationStatus}
                                </span>
                                {contribution.verifiedBy ? <span className="mt-1 block text-[11px] text-slate-500">By {contribution.verifiedBy}</span> : null}
                              </td>
                              <td className="max-w-[16rem] px-4 py-3 text-xs text-slate-400">
                                <span className="line-clamp-2">{contribution.verificationNotes || '—'}</span>
                              </td>
                            </tr>
                          );
                        })}
                        {statementMemberName && statementContributions.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-400">No statement records found for this member.</td>
                          </tr>
                        ) : null}
                        {!statementMemberName ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-400">Select a member to view their statement.</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            />
          </div>

          <Module
            title="Merry-Go-Round Schedule"
            content={
              <div className="space-y-3">
                <div className="space-y-3 sm:hidden">
                  {merryGoRound.map((round) => (
                    <article key={round.id} className={`rounded-3xl border p-4 shadow-xl shadow-black/20 ${round.status === 'Current' ? 'border-cyan-300/30 bg-cyan-400/10' : 'border-white/10 bg-black/15'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Round #{round.roundNumber}</p>
                          <h3 className="mt-1 text-base font-black text-white">{round.recipientName}</h3>
                          <p className="mt-1 text-sm font-semibold text-emerald-300">{formatCurrency(round.payoutAmount)}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${round.status === 'Completed' ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-300/20' : round.status === 'Current' ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-300/20' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
                          {round.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Payout Date</p>
                          <p className="mt-1 text-sm text-slate-200">{formatCalendarDate(round.payoutDate)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {round.status !== 'Completed' && (
                          <button onClick={() => markRoundAsCompleted(round.id)} className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300" type="button">
                            Complete
                          </button>
                        )}
                        <button onClick={() => handleDeleteRound(round.id)} className="rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-300" type="button">
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}

                  {merryGoRound.length === 0 && (
                    <div className="rounded-3xl border border-white/10 bg-black/15 p-5 text-center text-sm text-slate-400">
                      No rounds scheduled yet.
                    </div>
                  )}
                </div>

                <div className="hidden sm:block visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
                  <table className="min-w-[760px] divide-y divide-white/10 overflow-hidden text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Round</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Recipient</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Payout Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10/50 [&_tr:hover]:bg-white/[0.035]">
                      {merryGoRound.map((round) => (
                        <tr key={round.id} className={round.status === 'Current' ? 'bg-cyan-400/5' : ''}>
                          <td className="px-4 py-3 text-sm font-bold text-slate-300">#{round.roundNumber}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-white">
                            {round.recipientName}
                            <span className="block text-xs font-normal text-emerald-400">{formatCurrency(round.payoutAmount)}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">{formatCalendarDate(round.payoutDate)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${round.status === 'Completed' ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-300/20' : round.status === 'Current' ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-300/20' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
                              {round.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-3">
                              {round.status !== 'Completed' && (
                                <button onClick={() => markRoundAsCompleted(round.id)} className="text-xs font-semibold text-emerald-400 underline hover:text-emerald-300" type="button">Complete</button>
                              )}
                              <button onClick={() => handleDeleteRound(round.id)} className="text-xs font-semibold text-rose-400 underline hover:text-rose-300" type="button">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {merryGoRound.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">No rounds scheduled yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          />
        </div>

        <div className="mb-8 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2">
          <Module
            title="Insurance Provider Policies"
            content={
              <div className="space-y-3">
                <div className="space-y-3 sm:hidden">
                  {insurancePolicies.map((policy) => (
                    <article key={policy.id} className="rounded-3xl border border-white/10 bg-black/15 p-4 shadow-xl shadow-black/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Insurance Provider</p>
                          <h3 className="mt-1 break-words text-base font-black text-white">{policy.providerName}</h3>
                          <p className="mt-1 break-words text-xs text-slate-400">{policy.policyNumber || 'No policy number'}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${policy.status === 'Active' ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-300/20' : policy.status === 'Pending' ? 'bg-amber-400/10 text-amber-300 border border-amber-300/20' : 'bg-rose-400/10 text-rose-300 border border-rose-300/20'}`}>
                          {policy.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Month</p>
                          <p className="mt-1 text-sm text-slate-200">{policy.month}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Premium</p>
                          <p className="mt-1 text-sm font-semibold text-emerald-300">{formatCurrency(policy.premiumTarget)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Start</p>
                          <p className="mt-1 text-sm text-slate-200">{formatCalendarDate(policy.policyStartDate)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">End</p>
                          <p className="mt-1 text-sm text-slate-200">{formatCalendarDate(policy.policyEndDate)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Last Respect Benefit</p>
                          <p className="mt-1 text-sm font-semibold text-cyan-300">{formatCurrency(policy.lastRespectBenefit)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button onClick={() => handleDeleteInsurancePolicy(policy.id)} className="rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-300" type="button">
                          Delete Policy
                        </button>
                      </div>
                    </article>
                  ))}

                  {insurancePolicies.length === 0 && (
                    <div className="rounded-3xl border border-white/10 bg-black/15 p-5 text-center text-sm text-slate-400">
                      No insurance provider policies yet.
                    </div>
                  )}
                </div>

                <div className="hidden sm:block visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
                  <table className="min-w-[820px] divide-y divide-white/10 overflow-hidden text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Provider</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Month</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Coverage Dates</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Premium</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Benefit</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10/50 [&_tr:hover]:bg-white/[0.035]">
                      {insurancePolicies.map((policy) => (
                        <tr key={policy.id}>
                          <td className="px-4 py-3">
                            <span className="block font-semibold text-white">{policy.providerName}</span>
                            <span className="text-xs text-slate-400">{policy.policyNumber || 'No policy number'}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">{policy.month}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            <span className="block">Start: {formatCalendarDate(policy.policyStartDate)}</span>
                            <span className="block text-xs text-slate-400">End: {formatCalendarDate(policy.policyEndDate)}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-emerald-400">{formatCurrency(policy.premiumTarget)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-cyan-400">{formatCurrency(policy.lastRespectBenefit)}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDeleteInsurancePolicy(policy.id)} className="text-xs font-semibold text-rose-400 underline hover:text-rose-300" type="button">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {insurancePolicies.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">No insurance provider policies yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          />

          <Module
            title="Bereaved Family Cases"
            content={
              <div className="space-y-3">
                <div className="space-y-3 sm:hidden">
                  {bereavedCases.map((caseItem) => (
                    <article key={caseItem.id} className="rounded-3xl border border-white/10 bg-black/15 p-4 shadow-xl shadow-black/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Bereaved Case</p>
                          <h3 className="mt-1 break-words text-base font-black text-white">{caseItem.memberName}</h3>
                          <p className="mt-1 break-words text-xs text-slate-400">{caseItem.familyContact || 'No family contact'}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${caseItem.status === 'Closed' ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-300/20' : 'bg-amber-400/10 text-amber-300 border border-amber-300/20'}`}>
                          {caseItem.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Month</p>
                          <p className="mt-1 text-sm text-slate-200">{caseItem.month}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Case Date</p>
                          <p className="mt-1 text-sm text-slate-200">{formatCalendarDate(caseItem.caseDate)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Collected</p>
                          <p className="mt-1 text-sm font-semibold text-emerald-300">{formatCurrency(caseItem.collectedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Target</p>
                          <p className="mt-1 text-sm font-semibold text-cyan-300">{formatCurrency(caseItem.targetAmount)}</p>
                        </div>
                        {caseItem.notes ? (
                          <div className="col-span-2">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Notes</p>
                            <p className="mt-1 break-words text-sm text-slate-200">{caseItem.notes}</p>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {caseItem.status !== 'Closed' && (
                          <button onClick={() => markBereavedCaseClosed(caseItem.id)} className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300" type="button">
                            Close Case
                          </button>
                        )}
                        <button onClick={() => handleDeleteBereavedCase(caseItem.id)} className="rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-300" type="button">
                          Delete Case
                        </button>
                      </div>
                    </article>
                  ))}

                  {bereavedCases.length === 0 && (
                    <div className="rounded-3xl border border-white/10 bg-black/15 p-5 text-center text-sm text-slate-400">
                      No bereaved cases yet.
                    </div>
                  )}
                </div>

                <div className="hidden sm:block visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
                  <table className="min-w-[820px] divide-y divide-white/10 overflow-hidden text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Member / Family</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Month</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Case Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Collected</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10/50 [&_tr:hover]:bg-white/[0.035]">
                      {bereavedCases.map((caseItem) => (
                        <tr key={caseItem.id}>
                          <td className="px-4 py-3">
                            <span className="block font-semibold text-white">{caseItem.memberName}</span>
                            <span className="text-xs text-slate-400">{caseItem.familyContact || 'No family contact'}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">{caseItem.month}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{formatCalendarDate(caseItem.caseDate)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-emerald-400">
                            {formatCurrency(caseItem.collectedAmount)}
                            <span className="block text-xs text-slate-400">Target: {formatCurrency(caseItem.targetAmount)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${caseItem.status === 'Closed' ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-300/20' : 'bg-amber-400/10 text-amber-300 border border-amber-300/20'}`}>
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-3">
                              {caseItem.status !== 'Closed' && <button onClick={() => markBereavedCaseClosed(caseItem.id)} className="text-xs font-semibold text-emerald-400 underline hover:text-emerald-300" type="button">Close</button>}
                              <button onClick={() => handleDeleteBereavedCase(caseItem.id)} className="text-xs font-semibold text-rose-400 underline hover:text-rose-300" type="button">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {bereavedCases.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">No bereaved cases yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          />
        </div>

        <div className="mb-8 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">Add Group Member</h3>
            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5">
              <input type="text" required value={newMember.name} onChange={(event) => setNewMember((previous) => ({ ...previous, name: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Full name" />
              <input type="email" value={newMember.email} onChange={(event) => setNewMember((previous) => ({ ...previous, email: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Email" />
              <input type="text" value={newMember.contact} onChange={(event) => setNewMember((previous) => ({ ...previous, contact: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Contact phone" />
              <label className="block text-xs font-semibold text-slate-300">Join Date</label>
              <input type="date" value={newMember.joinDate} onChange={(event) => setNewMember((previous) => ({ ...previous, joinDate: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" />
              <input type="number" value={newMember.insurancePaid} onChange={(event) => setNewMember((previous) => ({ ...previous, insurancePaid: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Insurance paid" />
              <select value={newMember.status} onChange={(event) => setNewMember((previous) => ({ ...previous, status: event.target.value as PaymentStatus }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
              <button type="submit" disabled={submittingMember || !canManageMembers} className="w-full rounded-2xl border border-cyan-300/20 bg-cyan-400/20 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/20 backdrop-blur-xl transition hover:bg-cyan-400/30 disabled:opacity-60">{submittingMember ? 'Saving...' : 'Add Member'}</button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Import Members</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">Upload CSV/TXT or paste rows. Supported columns: name, email, contact, insurancePaid, status, joinDate.</p>
              </div>
              <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">Bulk Add</span>
            </div>

            <div className="space-y-3.5">
              <label className="block rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-400/10 px-4 py-4 text-center text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/15">
                <input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={handleMemberImportFileChange} disabled={!canManageMembers || importingMembers} className="hidden" />
                {memberImportFileName ? `Loaded: ${memberImportFileName}` : 'Upload CSV or TXT file'}
              </label>

              <textarea
                value={memberImportText}
                onChange={(event) => {
                  setMemberImportText(event.target.value);
                  setMemberImportPreview([]);
                }}
                disabled={!canManageMembers || importingMembers}
                className="min-h-36 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder={'Example:\nname,email,contact,insurancePaid,status,joinDate\nJane Wanjiku,jane@email.com,0712345678,750,Paid,2026-06-01\nPeter Mwangi,peter@email.com,0799999999,0,Pending,2026-06-01'}
              />

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={handlePreviewMemberImport} disabled={!canManageMembers || importingMembers || !memberImportText.trim()} className="rounded-2xl border border-cyan-300/20 bg-cyan-400/20 px-4 py-3 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/20 backdrop-blur-xl transition hover:bg-cyan-400/30 disabled:opacity-60">
                  Preview
                </button>
                <button type="button" onClick={handleClearMemberImport} disabled={importingMembers || (!memberImportText && memberImportPreview.length === 0)} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-slate-100 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:bg-white/[0.14] disabled:opacity-60">
                  Clear
                </button>
              </div>

              {memberImportPreview.length > 0 ? (
                <div className="space-y-3 rounded-3xl border border-white/10 bg-black/15 p-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3">
                      <p className="text-lg font-black text-emerald-200">{memberImportPreview.filter((row) => !row.error).length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100/80">Valid</p>
                    </div>
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3">
                      <p className="text-lg font-black text-amber-200">{memberImportPreview.filter((row) => row.duplicate).length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100/80">Duplicates</p>
                    </div>
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3">
                      <p className="text-lg font-black text-rose-200">{memberImportPreview.filter((row) => row.error && !row.duplicate).length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100/80">Issues</p>
                    </div>
                  </div>

                  <div className="visible-horizontal-scrollbar max-h-72 w-full max-w-full overflow-x-auto overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/30 pb-3">
                    <table className="min-w-[760px] divide-y divide-white/10 text-xs">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-[0.16em] text-slate-300">Row</th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-[0.16em] text-slate-300">Name</th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-[0.16em] text-slate-300">Contact</th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-[0.16em] text-slate-300">Insurance</th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-[0.16em] text-slate-300">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {memberImportPreview.slice(0, 8).map((row) => (
                          <tr key={`${row.rowNumber}-${row.name}`} className={row.error ? 'bg-rose-400/5' : 'bg-emerald-400/5'}>
                            <td className="px-3 py-2 font-bold text-slate-300">{row.rowNumber}</td>
                            <td className="px-3 py-2">
                              <span className="block font-semibold text-white">{row.name || 'Missing name'}</span>
                              <span className={row.error ? 'text-rose-300' : 'text-slate-400'}>{row.error || row.email || 'No email'}</span>
                            </td>
                            <td className="px-3 py-2 text-slate-300">{row.contact || '—'}</td>
                            <td className="px-3 py-2 text-emerald-300">{formatCurrency(row.insurancePaid)}</td>
                            <td className="px-3 py-2 text-slate-300">{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {memberImportPreview.length > 8 ? (
                    <p className="text-xs text-slate-400">Showing first 8 rows only. All valid rows will be imported.</p>
                  ) : null}

                  <button type="button" onClick={handleImportMembers} disabled={!canManageMembers || importingMembers || memberImportPreview.filter((row) => !row.error).length === 0} className="w-full rounded-2xl border border-emerald-300/20 bg-emerald-400/20 px-4 py-3 text-sm font-bold text-emerald-50 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition hover:bg-emerald-400/30 disabled:opacity-60">
                    {importingMembers ? 'Importing...' : `Import ${memberImportPreview.filter((row) => !row.error).length} Valid Member(s)`}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">Add Monthly Contributor</h3>
            <form onSubmit={handleAddContributionSubmit} className="space-y-3.5">
              <select required value={newContribution.memberName} onChange={(event) => setNewContribution((previous) => ({ ...previous, memberName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20">
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.name}>{member.name}</option>
                ))}
              </select>
              <input type="text" required value={newContribution.month} onChange={(event) => setNewContribution((previous) => ({ ...previous, month: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Month" />
              <label className="block text-xs font-semibold text-slate-300">Payment Date</label>
              <input type="date" value={newContribution.paymentDate} onChange={(event) => setNewContribution((previous) => ({ ...previous, paymentDate: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="0" value={newContribution.welfare} onChange={(event) => setNewContribution((previous) => ({ ...previous, welfare: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Welfare" />
                <input type="number" min="0" value={newContribution.merryGoRound} onChange={(event) => setNewContribution((previous) => ({ ...previous, merryGoRound: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Merry-go-round" />
                <input type="number" min="0" value={newContribution.insurance} onChange={(event) => setNewContribution((previous) => ({ ...previous, insurance: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Insurance" />
                <input type="number" min="0" value={newContribution.bereavedFamily} onChange={(event) => setNewContribution((previous) => ({ ...previous, bereavedFamily: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Bereaved family" />
              </div>
              <input type="number" min="0" value={newContribution.paidAmount} onChange={(event) => setNewContribution((previous) => ({ ...previous, paidAmount: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Paid amount / partial payment" />
              <select value={newContribution.paymentStatus} onChange={(event) => setNewContribution((previous) => ({ ...previous, paymentStatus: event.target.value as PaymentStatus }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                Expected: {formatCurrency(newContributionTotal)} • Paid: {formatCurrency(newContributionPaidAmount)} • Balance: {formatCurrency(newContributionBalance)}
              </div>
              <button type="submit" disabled={submittingContribution || !canManageFinance} className="w-full rounded-2xl border border-emerald-300/20 bg-emerald-400/20 py-2 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition hover:bg-emerald-400/30 disabled:opacity-60">{submittingContribution ? 'Saving...' : 'Add Monthly Contributor'}</button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl">
            <h3 className="mb-2 text-lg font-bold text-white">Generate Monthly Rows</h3>
            <p className="mb-4 text-xs text-slate-400">Create one contribution row for every current member, skipping members who already have a row for the selected month.</p>
            <form onSubmit={handleGenerateMonthlyRows} className="space-y-3.5">
              <input type="text" required value={generationMonth} onChange={(event) => setGenerationMonth(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Month e.g. July" />
              <label className="block text-xs font-semibold text-slate-300">Default Payment Date</label>
              <input type="date" value={monthlyGenerationDefaults.paymentDate} onChange={(event) => setMonthlyGenerationDefaults((previous) => ({ ...previous, paymentDate: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="0" value={monthlyGenerationDefaults.welfare} onChange={(event) => setMonthlyGenerationDefaults((previous) => ({ ...previous, welfare: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Default welfare" />
                <input type="number" min="0" value={monthlyGenerationDefaults.merryGoRound} onChange={(event) => setMonthlyGenerationDefaults((previous) => ({ ...previous, merryGoRound: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Default merry-go-round" />
                <input type="number" min="0" value={monthlyGenerationDefaults.insurance} onChange={(event) => setMonthlyGenerationDefaults((previous) => ({ ...previous, insurance: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Default insurance" />
                <input type="number" min="0" value={monthlyGenerationDefaults.bereavedFamily} onChange={(event) => setMonthlyGenerationDefaults((previous) => ({ ...previous, bereavedFamily: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Default bereaved" />
              </div>
              <select value={monthlyGenerationDefaults.paymentStatus} onChange={(event) => setMonthlyGenerationDefaults((previous) => ({ ...previous, paymentStatus: event.target.value as PaymentStatus }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-50">
                <div className="font-semibold">Rows to create: {generationMissingMembers.length} / {generationEligibleMembers.length}</div>
                <div className="mt-1 text-slate-300">Default expected per row: {formatCurrency(generationDefaultTotal)}</div>
              </div>
              <button type="submit" disabled={generatingMonthlyRows || !canManageFinance || generationMissingMembers.length === 0} className="w-full rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/20 py-2 text-sm font-semibold text-fuchsia-50 shadow-lg shadow-fuchsia-950/20 backdrop-blur-xl transition hover:bg-fuchsia-400/30 disabled:opacity-60">{generatingMonthlyRows ? 'Generating...' : 'Generate For All Members'}</button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">Schedule Round</h3>
            <form onSubmit={handleAddRoundSubmit} className="space-y-3.5">
              <input type="number" required value={newRound.roundNumber} onChange={(event) => setNewRound((previous) => ({ ...previous, roundNumber: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Round number" />
              <input type="text" required value={newRound.recipientName} onChange={(event) => setNewRound((previous) => ({ ...previous, recipientName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Recipient name" />
              <label className="block text-xs font-semibold text-slate-300">Payout Date</label>
              <input type="date" value={newRound.payoutDate} onChange={(event) => setNewRound((previous) => ({ ...previous, payoutDate: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" />
              <input type="number" value={newRound.payoutAmount} onChange={(event) => setNewRound((previous) => ({ ...previous, payoutAmount: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Payout amount" />
              <select value={newRound.status} onChange={(event) => setNewRound((previous) => ({ ...previous, status: event.target.value as RoundStatus }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20">
                <option value="Upcoming">Upcoming</option>
                <option value="Current">Current</option>
                <option value="Completed">Completed</option>
              </select>
              <button type="submit" disabled={submittingRound || !canManageFinance} className="w-full rounded-2xl border border-indigo-300/20 bg-indigo-400/20 py-2 text-sm font-semibold text-indigo-50 shadow-lg shadow-indigo-950/20 backdrop-blur-xl transition hover:bg-indigo-400/30 disabled:opacity-60">{submittingRound ? 'Scheduling...' : 'Commit Round'}</button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">Add Insurance Provider</h3>
            <form onSubmit={handleAddInsurancePolicySubmit} className="space-y-3.5">
              <input type="text" required value={newInsurancePolicy.providerName} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, providerName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Provider name" />
              <input type="text" value={newInsurancePolicy.policyNumber} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, policyNumber: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Policy number" />
              <label className="block text-xs font-semibold text-slate-300">Policy Start Date</label>
              <input type="date" value={newInsurancePolicy.policyStartDate} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, policyStartDate: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" />
              <label className="block text-xs font-semibold text-slate-300">Policy End Date</label>
              <input type="date" value={newInsurancePolicy.policyEndDate} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, policyEndDate: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" />
              <input type="number" value={newInsurancePolicy.premiumTarget} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, premiumTarget: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Premium target" />
              <input type="number" value={newInsurancePolicy.providerContribution} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, providerContribution: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Provider contribution" />
              <input type="number" value={newInsurancePolicy.lastRespectBenefit} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, lastRespectBenefit: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Last respect benefit" />
              <button type="submit" disabled={submittingInsurance || !canManageMembers} className="w-full rounded-2xl border border-cyan-300/20 bg-cyan-400/20 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/20 backdrop-blur-xl transition hover:bg-cyan-400/30 disabled:opacity-60">{submittingInsurance ? 'Saving...' : 'Add Provider'}</button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/5 backdrop-blur-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">Add Bereaved Case</h3>
            <form onSubmit={handleAddBereavedCaseSubmit} className="space-y-3.5">
              <input type="text" required value={newBereavedCase.memberName} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, memberName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Bereaved member name" />
              <input type="text" value={newBereavedCase.familyContact} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, familyContact: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Family contact" />
              <label className="block text-xs font-semibold text-slate-300">Case Date</label>
              <input type="date" value={newBereavedCase.caseDate} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, caseDate: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" />
              <input type="number" value={newBereavedCase.targetAmount} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, targetAmount: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Target amount" />
              <input type="number" value={newBereavedCase.collectedAmount} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, collectedAmount: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Collected amount" />
              <textarea value={newBereavedCase.notes} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, notes: event.target.value }))} className="min-h-20 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white shadow-inner shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-cyan-300/20" placeholder="Notes" />
              <button type="submit" disabled={submittingBereavedCase || !canManageMembers} className="w-full rounded-2xl border border-rose-300/20 bg-rose-400/20 py-2 text-sm font-semibold text-rose-50 shadow-lg shadow-rose-950/20 backdrop-blur-xl transition hover:bg-rose-400/30 disabled:opacity-60">{submittingBereavedCase ? 'Saving...' : 'Add Case'}</button>
            </form>
          </div>
        </div>

        <Module
          title="Member Tracker"
          content={
            <div className="visible-horizontal-scrollbar w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-cyan-300/20 bg-black/10 pb-5 shadow-inner shadow-black/20">
              <div className="table-scroll-hint sm:hidden">Swipe table ↔</div>
              <table className="min-w-[880px] divide-y divide-white/10 overflow-hidden text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Identity Details</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Communication</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Insurance Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10/50 [&_tr:hover]:bg-white/[0.035]">
                  {members.map((member) => {
                    const isEditing = editingMemberId === member.id;

                    return (
                      <tr key={member.id} className="transition-colors hover:bg-white/[0.04]">
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input type="text" name="name" value={editForm.name || ''} onChange={handleInputChange} className="mb-1 block rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                          ) : (
                            <span className="block font-semibold text-white">{member.name}</span>
                          )}
                          {isEditing ? (
                            <input type="date" name="joinDate" value={editForm.joinDate || todayIso()} onChange={handleInputChange} className="mt-1 block rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none" />
                          ) : (
                            <span className="text-xs text-slate-400">Joined: {formatCalendarDate(member.joinDate)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isEditing ? (
                            <>
                              <input type="email" name="email" value={editForm.email || ''} onChange={handleInputChange} className="mb-1 block w-full rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none" placeholder="Email" />
                              <input type="text" name="contact" value={editForm.contact || ''} onChange={handleInputChange} className="block w-full rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none" placeholder="Contact" />
                            </>
                          ) : (
                            <>
                              <span className="block text-slate-300">{member.email || '--'}</span>
                              <span className="block text-xs text-slate-400">{member.contact || '--'}</span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isEditing ? (
                            <input type="number" name="insurancePaid" value={editForm.insurancePaid ?? 0} onChange={handleInputChange} className="w-28 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                          ) : (
                            <span className="font-medium text-emerald-300">{formatCurrency(member.insurancePaid)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isEditing ? (
                            <select name="status" value={editForm.status || 'Pending'} onChange={handleInputChange} className="rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none">
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                          ) : (
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${member.status === 'Paid' ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-300/20' : 'bg-amber-400/10 text-amber-300 border border-amber-300/20'}`}>
                              {member.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => saveMemberChanges(member.id)} className="rounded-xl border border-emerald-300/20 bg-emerald-400/20 px-3 py-1 text-xs text-emerald-50 transition hover:bg-emerald-400/30" type="button">Save</button>
                              <button onClick={() => setEditingMemberId(null)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/15" type="button">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => startEditing(member)} className="text-xs font-semibold text-cyan-400 underline hover:text-cyan-300" type="button">Edit</button>
                              <button onClick={() => handleDeleteMember(member.id)} className="text-xs font-semibold text-rose-400 underline hover:text-rose-300" type="button">Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {members.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">No members yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          }
        />
      </main>

      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-2 rounded-[1.65rem] border border-white/10 bg-slate-950/82 p-2 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-2xl sm:hidden">
        <a href="#access-control" className="rounded-2xl bg-white/[0.08] px-2 py-2 text-center text-[11px] font-black text-slate-100">Home</a>
        <a href="#monthly-contributors" className="rounded-2xl bg-cyan-400/15 px-2 py-2 text-center text-[11px] font-black text-cyan-100">Money</a>
        <a href="#settings" className="rounded-2xl bg-white/[0.08] px-2 py-2 text-center text-[11px] font-black text-slate-100">Settings</a>
        <a href="#member-statement" className="rounded-2xl bg-white/[0.08] px-2 py-2 text-center text-[11px] font-black text-slate-100">Statement</a>
        <a href="#app-top" className="rounded-2xl bg-white/[0.08] px-2 py-2 text-center text-[11px] font-black text-slate-100">Top</a>
      </div>
    </div>
  );
}
