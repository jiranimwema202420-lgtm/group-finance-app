'use client';

import React, { useEffect, useState } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';

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
const CURRENT_GROUP_ID = 'demo_group_01';

type PaymentStatus = 'Paid' | 'Pending';
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

interface MonthlyContribution {
  id: string;
  memberName: string;
  month: string;
  amount: number;
  paymentDate: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  targetAmount: number;
  collectedAmount: number;
  status: BereavedStatus;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
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

const todayIso = () => new Date().toISOString().split('T')[0];
const currentMonthName = () => new Date().toLocaleString('en-US', { month: 'long' });

const StatCard: React.FC<StatCardProps> = ({ title, value, detail }) => (
  <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
    <p className="text-sm font-semibold text-slate-400">{title}</p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
    <p className="mt-2 text-xs text-slate-500">{detail}</p>
  </div>
);

const Module: React.FC<ModuleProps> = ({ title, content }) => (
  <div className="mb-8">
    <h2 className="mb-4 text-xl font-semibold text-slate-200">{title}</h2>
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">{content}</div>
  </div>
);

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [merryGoRound, setMerryGoRound] = useState<MerryGoRoundRound[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [bereavedCases, setBereavedCases] = useState<BereavedCase[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});

  const [submittingMember, setSubmittingMember] = useState(false);
  const [submittingContribution, setSubmittingContribution] = useState(false);
  const [submittingRound, setSubmittingRound] = useState(false);
  const [submittingInsurance, setSubmittingInsurance] = useState(false);
  const [submittingBereavedCase, setSubmittingBereavedCase] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    contact: '',
    insurancePaid: '',
    status: 'Pending' as PaymentStatus,
    joinDate: todayIso(),
  });

  const [newContribution, setNewContribution] = useState({
    memberName: '',
    month: currentMonthName(),
    amount: '',
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
    premiumTarget: '',
    providerContribution: '',
    lastRespectBenefit: '',
    status: 'Active' as InsuranceStatus,
  });

  const [newBereavedCase, setNewBereavedCase] = useState({
    memberName: '',
    familyContact: '',
    month: currentMonthName(),
    targetAmount: '',
    collectedAmount: '',
    status: 'Open' as BereavedStatus,
    notes: '',
  });

  useEffect(() => {
    async function fetchData() {
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
        const contribList = contribSnapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        })) as MonthlyContribution[];
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
      } catch (error) {
        console.error('Error loading dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleAddMemberSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      setNewMember({ name: '', email: '', contact: '', insurancePaid: '', status: 'Pending', joinDate: todayIso() });
    } catch (error) {
      console.error('Error creating member record:', error);
      alert('Failed to create member.');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleAddContributionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newContribution.memberName.trim() || !newContribution.amount) return;

    setSubmittingContribution(true);
    try {
      const contributionData = {
        memberName: newContribution.memberName.trim(),
        month: newContribution.month.trim(),
        amount: Number(newContribution.amount) || 0,
        paymentDate: newContribution.paymentDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'contributions'), contributionData);
      setContributions((previous) => [...previous, { id: docRef.id, ...contributionData }]);
      setNewContribution({ memberName: '', month: currentMonthName(), amount: '', paymentDate: todayIso() });
    } catch (error) {
      console.error('Error tracking contribution:', error);
      alert('Failed to log contribution.');
    } finally {
      setSubmittingContribution(false);
    }
  };

  const handleAddRoundSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      setNewRound({ roundNumber: '', payoutDate: todayIso(), recipientName: '', payoutAmount: '', status: 'Upcoming' });
    } catch (error) {
      console.error('Error building schedule timeline:', error);
      alert('Failed to schedule round.');
    } finally {
      setSubmittingRound(false);
    }
  };

  const handleAddInsurancePolicySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newInsurancePolicy.providerName.trim()) return;

    setSubmittingInsurance(true);
    try {
      const policyData = {
        providerName: newInsurancePolicy.providerName.trim(),
        policyNumber: newInsurancePolicy.policyNumber.trim(),
        month: newInsurancePolicy.month.trim(),
        premiumTarget: Number(newInsurancePolicy.premiumTarget) || 0,
        providerContribution: Number(newInsurancePolicy.providerContribution) || 0,
        lastRespectBenefit: Number(newInsurancePolicy.lastRespectBenefit) || 0,
        status: newInsurancePolicy.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'insurance'), policyData);
      setInsurancePolicies((previous) => [{ id: docRef.id, ...policyData }, ...previous]);
      setNewInsurancePolicy({ providerName: '', policyNumber: '', month: currentMonthName(), premiumTarget: '', providerContribution: '', lastRespectBenefit: '', status: 'Active' });
    } catch (error) {
      console.error('Error creating insurance policy:', error);
      alert('Failed to create insurance policy.');
    } finally {
      setSubmittingInsurance(false);
    }
  };

  const handleAddBereavedCaseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
        targetAmount,
        collectedAmount,
        status,
        notes: newBereavedCase.notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases'), caseData);
      setBereavedCases((previous) => [{ id: docRef.id, ...caseData }, ...previous]);
      setNewBereavedCase({ memberName: '', familyContact: '', month: currentMonthName(), targetAmount: '', collectedAmount: '', status: 'Open', notes: '' });
    } catch (error) {
      console.error('Error creating bereaved case:', error);
      alert('Failed to create bereaved family case.');
    } finally {
      setSubmittingBereavedCase(false);
    }
  };

  const startEditing = (member: Member) => {
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
      setEditingMemberId(null);
    } catch (error) {
      console.error('Failed to commit member updates:', error);
      alert('Failed to update member.');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Remove this member from the database?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'members', id));
      setMembers((previous) => previous.filter((member) => member.id !== id));
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('Failed to delete member.');
    }
  };

  const handleDeleteContribution = async (id: string) => {
    if (!window.confirm('Delete this contribution record?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'contributions', id));
      setContributions((previous) => previous.filter((contribution) => contribution.id !== id));
    } catch (error) {
      console.error('Failed to delete contribution:', error);
      alert('Failed to delete contribution.');
    }
  };

  const handleDeleteRound = async (id: string) => {
    if (!window.confirm('Delete this merry-go-round round?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'rounds', id));
      setMerryGoRound((previous) => previous.filter((round) => round.id !== id));
    } catch (error) {
      console.error('Failed to delete round:', error);
      alert('Failed to delete round.');
    }
  };

  const markRoundAsCompleted = async (id: string) => {
    try {
      const completedAt = new Date().toISOString();
      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'rounds', id), {
        status: 'Completed',
        completedAt,
        updatedAt: completedAt,
      });
      setMerryGoRound((previous) => previous.map((round) => (round.id === id ? { ...round, status: 'Completed', completedAt } : round)));
    } catch (error) {
      console.error('Failed to complete round:', error);
      alert('Failed to complete round.');
    }
  };

  const handleDeleteInsurancePolicy = async (id: string) => {
    if (!window.confirm('Delete this insurance provider policy record?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'insurance', id));
      setInsurancePolicies((previous) => previous.filter((policy) => policy.id !== id));
    } catch (error) {
      console.error('Failed to delete insurance policy:', error);
      alert('Failed to delete insurance policy.');
    }
  };

  const handleDeleteBereavedCase = async (id: string) => {
    if (!window.confirm('Delete this bereaved family case?')) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases', id));
      setBereavedCases((previous) => previous.filter((caseItem) => caseItem.id !== id));
    } catch (error) {
      console.error('Failed to delete bereaved case:', error);
      alert('Failed to delete bereaved case.');
    }
  };

  const markBereavedCaseClosed = async (id: string) => {
    try {
      const updatedAt = new Date().toISOString();
      await updateDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases', id), {
        status: 'Closed',
        updatedAt,
      });
      setBereavedCases((previous) => previous.map((caseItem) => (caseItem.id === id ? { ...caseItem, status: 'Closed', updatedAt } : caseItem)));
    } catch (error) {
      console.error('Failed to close bereaved case:', error);
      alert('Failed to close bereaved family case.');
    }
  };

  const exportContributionsCsv = () => {
    const headers = ['Member Name', 'Month', 'Amount', 'Payment Date'];
    const rows = contributions.map((contribution) => [contribution.memberName, contribution.month, contribution.amount, contribution.paymentDate]);
    const csv = [headers.join(','), ...rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jirani-contributions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const printDashboardReport = () => {
    window.print();
  };

  const totalMembers = members.length;
  const totalCollected = members.filter((member) => member.status === 'Paid').reduce((sum, member) => sum + member.insurancePaid, 0);
  const totalBalancePending = members.filter((member) => member.status === 'Pending').reduce((sum, member) => sum + member.insurancePaid, 0);
  const totalInsuranceTarget = insurancePolicies.reduce((sum, policy) => sum + policy.premiumTarget, 0);
  const totalLastRespectBenefit = insurancePolicies.reduce((sum, policy) => sum + policy.lastRespectBenefit, 0);
  const totalBereavedTarget = bereavedCases.reduce((sum, caseItem) => sum + caseItem.targetAmount, 0);
  const totalBereavedCollected = bereavedCases.reduce((sum, caseItem) => sum + caseItem.collectedAmount, 0);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString('en-US')}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="text-sm font-medium">Loading Database Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">Jirani Finance App</p>
          <h1 className="text-3xl font-bold text-white">Group Finance Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={exportContributionsCsv} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500" type="button">
            Export CSV
          </button>
          <button onClick={printDashboardReport} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700" type="button">
            Print Report
          </button>
        </div>
      </header>

      <main>
        <Module
          title="Stats"
          content={
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <StatCard title="Total Members" value={totalMembers} detail="From database records" />
              <StatCard title="Collected" value={formatCurrency(totalCollected)} detail="Completed member insurance" />
              <StatCard title="Balance" value={formatCurrency(totalBalancePending)} detail="Still pending collection" />
              <StatCard title="Insurance Target" value={formatCurrency(totalInsuranceTarget)} detail={`Benefit: ${formatCurrency(totalLastRespectBenefit)}`} />
              <StatCard title="Bereaved Support" value={formatCurrency(totalBereavedCollected)} detail={`Target: ${formatCurrency(totalBereavedTarget)}`} />
            </div>
          }
        />

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Module
            title="Monthly Contributions"
            content={
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Member</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Month</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Amount</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {contributions.map((contribution) => (
                      <tr key={contribution.id}>
                        <td className="px-4 py-3 font-medium text-white">{contribution.memberName}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{contribution.month}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-400">{formatCurrency(contribution.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteContribution(contribution.id)} className="text-xs font-semibold text-rose-400 underline hover:text-rose-300" type="button">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {contributions.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">No contributions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            }
          />

          <Module
            title="Merry-Go-Round Schedule"
            content={
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Round</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Recipient</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {merryGoRound.map((round) => (
                      <tr key={round.id} className={round.status === 'Current' ? 'bg-slate-800/30' : ''}>
                        <td className="px-4 py-3 text-sm font-bold text-slate-400">#{round.roundNumber}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-white">
                          {round.recipientName}
                          <span className="block text-xs font-normal text-emerald-400">{formatCurrency(round.payoutAmount)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${round.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : round.status === 'Current' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-700/30 text-slate-400'}`}>
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
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">No rounds scheduled yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            }
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Module
            title="Insurance Provider Policies"
            content={
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Provider</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Month</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Premium</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Benefit</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {insurancePolicies.map((policy) => (
                      <tr key={policy.id}>
                        <td className="px-4 py-3">
                          <span className="block font-semibold text-white">{policy.providerName}</span>
                          <span className="text-xs text-slate-500">{policy.policyNumber || 'No policy number'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{policy.month}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-400">{formatCurrency(policy.premiumTarget)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-cyan-400">{formatCurrency(policy.lastRespectBenefit)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteInsurancePolicy(policy.id)} className="text-xs font-semibold text-rose-400 underline hover:text-rose-300" type="button">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {insurancePolicies.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">No insurance provider policies yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            }
          />

          <Module
            title="Bereaved Family Cases"
            content={
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Member / Family</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Month</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Collected</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {bereavedCases.map((caseItem) => (
                      <tr key={caseItem.id}>
                        <td className="px-4 py-3">
                          <span className="block font-semibold text-white">{caseItem.memberName}</span>
                          <span className="text-xs text-slate-500">{caseItem.familyContact || 'No family contact'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{caseItem.month}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-400">
                          {formatCurrency(caseItem.collectedAmount)}
                          <span className="block text-xs text-slate-500">Target: {formatCurrency(caseItem.targetAmount)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${caseItem.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
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
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">No bereaved cases yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            }
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="mb-4 text-lg font-bold text-white">Add Group Member</h3>
            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5">
              <input type="text" required value={newMember.name} onChange={(event) => setNewMember((previous) => ({ ...previous, name: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Full name" />
              <input type="email" value={newMember.email} onChange={(event) => setNewMember((previous) => ({ ...previous, email: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Email" />
              <input type="text" value={newMember.contact} onChange={(event) => setNewMember((previous) => ({ ...previous, contact: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Contact phone" />
              <input type="number" value={newMember.insurancePaid} onChange={(event) => setNewMember((previous) => ({ ...previous, insurancePaid: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Insurance paid" />
              <select value={newMember.status} onChange={(event) => setNewMember((previous) => ({ ...previous, status: event.target.value as PaymentStatus }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
              <button type="submit" disabled={submittingMember} className="w-full rounded-xl bg-cyan-600 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60">{submittingMember ? 'Saving...' : 'Add Member'}</button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="mb-4 text-lg font-bold text-white">Log Contribution</h3>
            <form onSubmit={handleAddContributionSubmit} className="space-y-3.5">
              <input type="text" required value={newContribution.memberName} onChange={(event) => setNewContribution((previous) => ({ ...previous, memberName: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Member name" />
              <input type="text" required value={newContribution.month} onChange={(event) => setNewContribution((previous) => ({ ...previous, month: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Month" />
              <input type="number" required value={newContribution.amount} onChange={(event) => setNewContribution((previous) => ({ ...previous, amount: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Amount" />
              <button type="submit" disabled={submittingContribution} className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">{submittingContribution ? 'Logging...' : 'Log Contribution'}</button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="mb-4 text-lg font-bold text-white">Schedule Round</h3>
            <form onSubmit={handleAddRoundSubmit} className="space-y-3.5">
              <input type="number" required value={newRound.roundNumber} onChange={(event) => setNewRound((previous) => ({ ...previous, roundNumber: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Round number" />
              <input type="text" required value={newRound.recipientName} onChange={(event) => setNewRound((previous) => ({ ...previous, recipientName: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Recipient name" />
              <input type="number" value={newRound.payoutAmount} onChange={(event) => setNewRound((previous) => ({ ...previous, payoutAmount: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Payout amount" />
              <select value={newRound.status} onChange={(event) => setNewRound((previous) => ({ ...previous, status: event.target.value as RoundStatus }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none">
                <option value="Upcoming">Upcoming</option>
                <option value="Current">Current</option>
                <option value="Completed">Completed</option>
              </select>
              <button type="submit" disabled={submittingRound} className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">{submittingRound ? 'Scheduling...' : 'Commit Round'}</button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="mb-4 text-lg font-bold text-white">Add Insurance Provider</h3>
            <form onSubmit={handleAddInsurancePolicySubmit} className="space-y-3.5">
              <input type="text" required value={newInsurancePolicy.providerName} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, providerName: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Provider name" />
              <input type="text" value={newInsurancePolicy.policyNumber} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, policyNumber: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Policy number" />
              <input type="number" value={newInsurancePolicy.premiumTarget} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, premiumTarget: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Premium target" />
              <input type="number" value={newInsurancePolicy.lastRespectBenefit} onChange={(event) => setNewInsurancePolicy((previous) => ({ ...previous, lastRespectBenefit: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Last respect benefit" />
              <button type="submit" disabled={submittingInsurance} className="w-full rounded-xl bg-cyan-600 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60">{submittingInsurance ? 'Saving...' : 'Add Provider'}</button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="mb-4 text-lg font-bold text-white">Add Bereaved Case</h3>
            <form onSubmit={handleAddBereavedCaseSubmit} className="space-y-3.5">
              <input type="text" required value={newBereavedCase.memberName} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, memberName: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Bereaved member name" />
              <input type="text" value={newBereavedCase.familyContact} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, familyContact: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Family contact" />
              <input type="number" value={newBereavedCase.targetAmount} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, targetAmount: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Target amount" />
              <input type="number" value={newBereavedCase.collectedAmount} onChange={(event) => setNewBereavedCase((previous) => ({ ...previous, collectedAmount: event.target.value }))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Collected amount" />
              <button type="submit" disabled={submittingBereavedCase} className="w-full rounded-xl bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60">{submittingBereavedCase ? 'Saving...' : 'Add Case'}</button>
            </form>
          </div>
        </div>

        <Module
          title="Member Tracker"
          content={
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Identity Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Communication</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Insurance Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {members.map((member) => {
                    const isEditing = editingMemberId === member.id;

                    return (
                      <tr key={member.id} className="transition-colors hover:bg-slate-900/50">
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input type="text" name="name" value={editForm.name || ''} onChange={handleInputChange} className="mb-1 block rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                          ) : (
                            <span className="block font-semibold text-white">{member.name}</span>
                          )}
                          <span className="text-xs text-slate-500">Joined: {member.joinDate}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isEditing ? (
                            <>
                              <input type="email" name="email" value={editForm.email || ''} onChange={handleInputChange} className="mb-1 block w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none" placeholder="Email" />
                              <input type="text" name="contact" value={editForm.contact || ''} onChange={handleInputChange} className="block w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none" placeholder="Contact" />
                            </>
                          ) : (
                            <>
                              <span className="block text-slate-300">{member.email || '--'}</span>
                              <span className="block text-xs text-slate-500">{member.contact || '--'}</span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isEditing ? (
                            <input type="number" name="insurancePaid" value={editForm.insurancePaid ?? 0} onChange={handleInputChange} className="w-28 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                          ) : (
                            <span className="font-medium text-emerald-300">{formatCurrency(member.insurancePaid)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isEditing ? (
                            <select name="status" value={editForm.status || 'Pending'} onChange={handleInputChange} className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none">
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                          ) : (
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${member.status === 'Paid' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
                              {member.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => saveMemberChanges(member.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white transition-colors hover:bg-emerald-500" type="button">Save</button>
                              <button onClick={() => setEditingMemberId(null)} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-700" type="button">Cancel</button>
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
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">No members yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          }
        />
      </main>
    </div>
  );
}
