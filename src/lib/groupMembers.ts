export const MEMBERS_CACHE_KEY = "jirani_group_members_source_v1";

export type GroupMember = {
  id: string;
  memberNumber?: number;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  status?: string;
  monthlyContribution?: number;
  insurancePremium?: number;
  merryGoRound?: number;
  joinDate?: string;
  exitDate?: string;
  notes?: string;
};

function readText(value: unknown) {
  return String(value || "").trim();
}

function readNumber(value: unknown) {
  return Number(value || 0);
}

export function normalizeGroupMember(
  id: string,
  data: Record<string, unknown>
): GroupMember {
  const name =
    readText(data.name) ||
    readText(data.memberName) ||
    readText(data.fullName) ||
    readText(data.displayName);

  return {
    id,
    memberNumber: readNumber(data.memberNumber),
    name,
    phone: readText(data.phone),
    email: readText(data.email),
    role: readText(data.role) || "Member",
    status: readText(data.status) || "Active",
    monthlyContribution: readNumber(data.monthlyContribution),
    insurancePremium: readNumber(data.insurancePremium),
    merryGoRound: readNumber(data.merryGoRound),
    joinDate: readText(data.joinDate),
    exitDate: readText(data.exitDate),
    notes: readText(data.notes),
  };
}

export function sortMembersByName(members: GroupMember[]) {
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
}

export function isActiveMember(member: GroupMember) {
  const status = String(member.status || "Active").toLowerCase();
  return status !== "inactive" && status !== "exited";
}

export function cacheMembers(members: GroupMember[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(MEMBERS_CACHE_KEY, JSON.stringify(members));
  } catch {
    // Ignore local cache failures.
  }
}

export function readCachedMembers() {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(MEMBERS_CACHE_KEY);
    return saved ? (JSON.parse(saved) as GroupMember[]) : [];
  } catch {
    return [];
  }
}
