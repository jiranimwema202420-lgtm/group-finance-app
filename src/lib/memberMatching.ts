export type MemberLike = {
  id?: string;
  name?: string;
};

export type ContributionLike = {
  memberId?: string;
  memberName?: string;
};

export function normalizeMemberName(value: string | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function contributionBelongsToMember(
  contribution: ContributionLike,
  member: MemberLike
) {
  const contributionMemberId = String(contribution.memberId || "").trim();
  const memberId = String(member.id || "").trim();

  if (contributionMemberId && memberId) {
    return contributionMemberId === memberId;
  }

  return (
    normalizeMemberName(contribution.memberName) ===
    normalizeMemberName(member.name)
  );
}
