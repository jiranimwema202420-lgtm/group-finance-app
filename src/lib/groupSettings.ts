export const CURRENT_GROUP_ID = "demo_group_01";
export const GROUP_SETTINGS_STORAGE_KEY = "jirani_group_settings_v1";

export type GroupSettings = {
  groupName: string;
  groupId: string;
  currency: string;
  monthlyContribution: number;
  insurancePremium: number;
  merryGoRound: number;
  adminNotes: string;
  roles: string;
};

export const defaultGroupSettings: GroupSettings = {
  groupName: "Jirani Mwema",
  groupId: CURRENT_GROUP_ID,
  currency: "KES",
  monthlyContribution: 200,
  insurancePremium: 750,
  merryGoRound: 1000,
  adminNotes:
    "Only Admins should update group settings. Treasurers handle contributions, payouts, and finance records.",
  roles: "ADMIN, TREASURER, CHAIRPERSON, MEMBER",
};

export function normalizeGroupSettings(
  data: Partial<GroupSettings>
): GroupSettings {
  return {
    groupName: data.groupName || defaultGroupSettings.groupName,
    groupId: CURRENT_GROUP_ID,
    currency: data.currency || defaultGroupSettings.currency,
    monthlyContribution: Number(
      data.monthlyContribution || defaultGroupSettings.monthlyContribution
    ),
    insurancePremium: Number(
      data.insurancePremium || defaultGroupSettings.insurancePremium
    ),
    merryGoRound: Number(data.merryGoRound || defaultGroupSettings.merryGoRound),
    adminNotes: data.adminNotes || defaultGroupSettings.adminNotes,
    roles: data.roles || defaultGroupSettings.roles,
  };
}

export function formatMoney(currency: string, value: number) {
  return `${currency || "KES"} ${Number(value || 0).toLocaleString("en-KE")}`;
}
