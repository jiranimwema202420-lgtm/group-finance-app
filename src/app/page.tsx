'use client';

import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

// ==========================================
// Firebase Initialization with Credentials
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAoaJmF72UdLDd7kKfdvRMH_j_NFL8KZj8",
  authDomain: "studio-7602007172-1035f.firebaseapp.com",
  projectId: "studio-7602007172-1035f",
  storageBucket: "studio-7602007172-1035f.firebasestorage.app",
  messagingSenderId: "605000372115",
  appId: "1:605000372115:web:1b6ee36d456841d598e266"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sandbox Development Group ID to bypass auth checks via the updated rule matrix
const CURRENT_GROUP_ID = "demo_group_01";

// ==========================================
// Types & Interfaces
// ==========================================
interface Member {
  id: string;
  name: string;
  email: string;
  contact: string;
  insurancePaid: number;
  status: 'Paid' | 'Pending';
  joinDate: string;
}

interface MonthlyContribution {
  id: string;
  memberName: string;
  month: string;
  amount: number;
  paymentDate: string;
}

interface MerryGoRoundRound {
  id: string;
  roundNumber: number;
  payoutDate: string;
  recipientName: string;
  payoutAmount: number;
  status: 'Completed' | 'Current' | 'Upcoming';
}

interface InsurancePolicy {
  id: string;
  providerName: string;
  policyNumber: string;
  month: string;
  premiumTarget: number;
  providerContribution: number;
  lastRespectBenefit: number;
  status: 'Active' | 'Pending' | 'Expired';
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
  status: 'Open' | 'Closed';
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

// ==========================================
// Sub-Components
// ==========================================
const StatCard: React.FC<StatCardProps> = ({ title, value, detail }) => (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
);

const Module: React.FC<ModuleProps> = ({ title, content }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">{title}</h2>
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        {content}
      </div>
    </div>
);

// ==========================================
// Main Next.js Page Component
// ==========================================
export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [merryGoRound, setMerryGoRound] = useState<MerryGoRoundRound[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [bereavedCases, setBereavedCases] = useState<BereavedCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline Editing States
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});

  // Form Submission Spinners
  const [submittingMember, setSubmittingMember] = useState(false);
  const [submittingContribution, setSubmittingContribution] = useState(false);
  const [submittingRound, setSubmittingRound] = useState(false);
  
  const [submittingInsurance, setSubmittingInsurance] = useState(false);
const [submittingBereavedCase, setSubmittingBereavedCase] = useState(false);
  // Form Structural States
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    contact: '',
    insurancePaid: '',
    status: 'Pending' as 'Paid' | 'Pending',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [newContribution, setNewContribution] = useState({
    memberName: '',
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [newRound, setNewRound] = useState({
    roundNumber: '',
    payoutDate: new Date().toISOString().split('T')[0],
    recipientName: '',
    payoutAmount: '',
    status: 'Upcoming' as 'Completed' | 'Current' | 'Upcoming'
  });

  const [newInsurancePolicy, setNewInsurancePolicy] = useState({
  providerName: '',
  policyNumber: '',
  month: new Date().toLocaleString('en-US', { month: 'long' }),
  premiumTarget: '',
  providerContribution: '',
  lastRespectBenefit: '',
  status: 'Active' as 'Active' | 'Pending' | 'Expired'
});

const [newBereavedCase, setNewBereavedCase] = useState({
  memberName: '',
  familyContact: '',
  month: new Date().toLocaleString('en-US', { month: 'long' }),
  targetAmount: '',
  collectedAmount: '',
  status: 'Open' as 'Open' | 'Closed',
  notes: ''
});

  useEffect(() => {
    async function fetchData() {
      try {
        const membersSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'members'));
        const membersList = membersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            contact: data.contact || '',
            insurancePaid: data.insurancePaid || 0,
            status: data.status || 'Pending',
            joinDate: data.joinDate || new Date().toISOString().split('T')[0]
          };
        }) as Member[];
        setMembers(membersList);

        const contribSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'contributions'));
        const contribList = contribSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MonthlyContribution[];
        setContributions(contribList);

        const mgrSnapshot = await getDocs(collection(db, 'groups', CURRENT_GROUP_ID, 'rounds'));
        const mgrList = mgrSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MerryGoRoundRound[];
        mgrList.sort((a, b) => a.roundNumber - b.roundNumber);
        setMerryGoRound(mgrList);

        const insuranceSnapshot = await getDocs(
  collection(db, 'groups', CURRENT_GROUP_ID, 'insurance')
);

const insuranceList = insuranceSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
})) as InsurancePolicy[];

setInsurancePolicies(insuranceList);

const bereavedSnapshot = await getDocs(
  collection(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases')
);

const bereavedList = bereavedSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
})) as BereavedCase[];

setBereavedCases(bereavedList);

      } catch (error) {
        console.error("Error loading dashboard metrics: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Creation Handlers
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    setSubmittingMember(true);
    try {
      const memberData = {
        name: newMember.name,
        email: newMember.email,
        contact: newMember.contact,
        insurancePaid: Number(newMember.insurancePaid) || 0,
        status: newMember.status,
        joinDate: newMember.joinDate
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'members'), memberData);
      setMembers(prev => [...prev, { id: docRef.id, ...memberData }]);

      setNewMember({
        name: '',
        email: '',
        contact: '',
        insurancePaid: '',
        status: 'Pending',
        joinDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error creating member record: ", error);
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleAddContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContribution.memberName.trim() || !newContribution.amount) return;

    setSubmittingContribution(true);
    try {
      const contributionData = {
        memberName: newContribution.memberName,
        month: newContribution.month,
        amount: Number(newContribution.amount),
        paymentDate: newContribution.paymentDate
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'contributions'), contributionData);
      setContributions(prev => [...prev, { id: docRef.id, ...contributionData }]);

      setNewContribution({
        memberName: '',
        month: new Date().toLocaleString('en-US', { month: 'long' }),
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error tracking contribution instance: ", error);
    } finally {
      setSubmittingContribution(false);
    }
  };

  const handleAddRoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRound.recipientName.trim() || !newRound.roundNumber) return;
    
    const handleAddInsurancePolicySubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newInsurancePolicy.providerName.trim()) return;

  setSubmittingInsurance(true);

  try {
    const policyData = {
      providerName: newInsurancePolicy.providerName,
      policyNumber: newInsurancePolicy.policyNumber,
      month: newInsurancePolicy.month,
      premiumTarget: Number(newInsurancePolicy.premiumTarget) || 0,
      providerContribution: Number(newInsurancePolicy.providerContribution) || 0,
      lastRespectBenefit: Number(newInsurancePolicy.lastRespectBenefit) || 0,
      status: newInsurancePolicy.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(
      collection(db, 'groups', CURRENT_GROUP_ID, 'insurance'),
      policyData
    );

    setInsurancePolicies(prev => [
      { id: docRef.id, ...policyData },
      ...prev
    ]);

    setNewInsurancePolicy({
      providerName: '',
      policyNumber: '',
      month: new Date().toLocaleString('en-US', { month: 'long' }),
      premiumTarget: '',
      providerContribution: '',
      lastRespectBenefit: '',
      status: 'Active'
    });
  } catch (error) {
    console.error('Error creating insurance policy:', error);
    alert('Failed to create insurance policy.');
  } finally {
    setSubmittingInsurance(false);
  }
};

const handleAddBereavedCaseSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newBereavedCase.memberName.trim()) return;

  setSubmittingBereavedCase(true);

  try {
    const targetAmount = Number(newBereavedCase.targetAmount) || 0;
    const collectedAmount = Number(newBereavedCase.collectedAmount) || 0;

    const caseData = {
      memberName: newBereavedCase.memberName,
      familyContact: newBereavedCase.familyContact,
      month: newBereavedCase.month,
      targetAmount,
      collectedAmount,
      status:
        collectedAmount >= targetAmount && targetAmount > 0
          ? 'Closed' as const
          : newBereavedCase.status,
      notes: newBereavedCase.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(
      collection(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases'),
      caseData
    );

    setBereavedCases(prev => [
      { id: docRef.id, ...caseData },
      ...prev
    ]);

    setNewBereavedCase({
      memberName: '',
      familyContact: '',
      month: new Date().toLocaleString('en-US', { month: 'long' }),
      targetAmount: '',
      collectedAmount: '',
      status: 'Open',
      notes: ''
    });
  } catch (error) {
    console.error('Error creating bereaved case:', error);
    alert('Failed to create bereaved family case.');
  } finally {
    setSubmittingBereavedCase(false);
  }
};
    setSubmittingRound(true);
    try {
      const roundData = {
        roundNumber: Number(newRound.roundNumber),
        payoutDate: newRound.payoutDate,
        recipientName: newRound.recipientName,
        payoutAmount: Number(newRound.payoutAmount) || 0,
        status: newRound.status
      };

      const docRef = await addDoc(collection(db, 'groups', CURRENT_GROUP_ID, 'rounds'), roundData);
      setMerryGoRound(prev => {
        const updated = [...prev, { id: docRef.id, ...roundData }];
        return updated.sort((a, b) => a.roundNumber - b.roundNumber);
      });

      setNewRound({
        roundNumber: '',
        payoutDate: new Date().toISOString().split('T')[0],
        recipientName: '',
        payoutAmount: '',
        status: 'Upcoming'
      });
    } catch (error) {
      console.error("Error building schedule timeline: ", error);
    } finally {
      setSubmittingRound(false);
    }
  };

  // Inline Editing Handlers
  const startEditing = (member: Member) => {
    setEditingMemberId(member.id);
    setEditForm(member);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'insurancePaid' ? Number(value) : value
    }));
  };

  const saveMemberChanges = async (id: string) => {
    try {
      const memberRef = doc(db, 'groups', CURRENT_GROUP_ID, 'members', id);
      await updateDoc(memberRef, {
        name: editForm.name,
        email: editForm.email,
        contact: editForm.contact,
        insurancePaid: editForm.insurancePaid,
        status: editForm.status,
        joinDate: editForm.joinDate
      });

      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...editForm as Member } : m));
      setEditingMemberId(null);
    } catch (error) {
      console.error("Failed to commit updates: ", error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this member from the database?")) return;
    try {
      await deleteDoc(doc(db, 'groups', CURRENT_GROUP_ID, 'members', id));
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Failed to delete record: ", error);
    }
  };

    const printDashboardReport = () => {
    window.print();
  };

  const handleDeleteInsurancePolicy = async (id: string) => {
    if (!window.confirm('Delete this insurance policy record?')) return;

    try {
      await deleteDoc(
        doc(db, 'groups', CURRENT_GROUP_ID, 'insurance', id)
      );

      setInsurancePolicies(prev => prev.filter(policy => policy.id !== id));
    } catch (error) {
      console.error('Failed to delete insurance policy:', error);
      alert('Failed to delete insurance policy.');
    }
  };

  const handleDeleteBereavedCase = async (id: string) => {
    if (!window.confirm('Delete this bereaved family case?')) return;

    try {
      await deleteDoc(
        doc(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases', id)
      );

      setBereavedCases(prev => prev.filter(caseItem => caseItem.id !== id));
    } catch (error) {
      console.error('Failed to delete bereaved case:', error);
      alert('Failed to delete bereaved case.');
    }
  };

  const markBereavedCaseClosed = async (id: string) => {
    try {
      const updatedAt = new Date().toISOString();

      await updateDoc(
        doc(db, 'groups', CURRENT_GROUP_ID, 'bereavedCases', id),
        {
          status: 'Closed',
          updatedAt
        }
      );

      setBereavedCases(prev =>
        prev.map(caseItem =>
          caseItem.id === id
            ? { ...caseItem, status: 'Closed', updatedAt }
            : caseItem
        )
      );
    } catch (error) {
      console.error('Failed to close bereaved case:', error);
      alert('Failed to close bereaved family case.');
    }
  };

  const totalMembers = members.length;
  const totalCollected = members.filter(m => m.status === 'Paid').reduce((sum, m) => sum + m.insurancePaid, 0);
  const totalBalancePending = members.filter(m => m.status === 'Pending').reduce((sum, m) => sum + m.insurancePaid, 0);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US')}`;

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium">Loading Database Dashboard...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Interactive Dashboard</h1>
        </header>

        <main>
          {/* Stats Module */}
          <Module
              title="Stats"
              content={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title="Total Members" value={totalMembers} detail="From database records" />
                  <StatCard title="Collected" value={formatCurrency(totalCollected)} detail="Completed transactions" />
                  <StatCard title="Balance" value={formatCurrency(totalBalancePending)} detail="Still pending collection" />
                </div>
              }
          />

          {/* 2-Column Tables Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Module
                title="Monthly Contributions"
                content={
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                      <thead>
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Member</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Month</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Amount</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                      {contributions.map((c) => (
                          <tr key={c.id}>
                            <td className="py-3 px-4 font-medium text-white">{c.memberName}</td>
                            <td className="py-3 px-4 text-sm text-slate-300">{c.month}</td>
                            <td className="py-3 px-4 text-sm text-emerald-400 font-semibold">{formatCurrency(c.amount)}</td>
                          </tr>
                      ))}
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
                        <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Round</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Recipient</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Status</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                      {merryGoRound.map((round) => (
                          <tr key={round.id} className={round.status === 'Current' ? 'bg-slate-800/30' : ''}>
                            <td className="py-3 px-4 text-sm font-bold text-slate-400">#{round.roundNumber}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-white">
                              {round.recipientName}
                              <span className="block text-xs font-normal text-emerald-400">{formatCurrency(round.payoutAmount)}</span>
                            </td>
                            <td className="py-3 px-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              round.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                  round.status === 'Current' ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' :
                                      'bg-slate-700/30 text-slate-400'
                          }`}>
                            {round.status}
                          </span>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                }
            />
          </div>

          {/* Data Insertion Forms Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Add New Member */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Add Group Member</h3>
              <form onSubmit={handleAddMemberSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input type="text" required value={newMember.name} onChange={(e) => setNewMember(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="Jane Doe" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                    <input type="email" required value={newMember.email} onChange={(e) => setNewMember(p => ({ ...p, email: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Phone</label>
                    <input type="text" required value={newMember.contact} onChange={(e) => setNewMember(p => ({ ...p, contact: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="+254..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Insurance Paid ($)</label>
                    <input type="number" value={newMember.insurancePaid} onChange={(e) => setNewMember(p => ({ ...p, insurancePaid: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="2500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                    <select value={newMember.status} onChange={(e) => setNewMember(p => ({ ...p, status: e.target.value as 'Paid' | 'Pending' }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={submittingMember} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm py-2 rounded-xl transition-colors mt-2">{submittingMember ? 'Saving...' : 'Add Member'}</button>
              </form>
            </div>

            {/* Add Monthly Contribution */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Log Contribution</h3>
              <form onSubmit={handleAddContributionSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Member Name</label>
                  <input type="text" required value={newContribution.memberName} onChange={(e) => setNewContribution(p => ({ ...p, memberName: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="Match member identity name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Target Month</label>
                    <input type="text" required value={newContribution.month} onChange={(e) => setNewContribution(p => ({ ...p, month: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Amount ($)</label>
                    <input type="number" required value={newContribution.amount} onChange={(e) => setNewContribution(p => ({ ...p, amount: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="500" />
                  </div>
                </div>
                <button type="submit" disabled={submittingContribution} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2 rounded-xl transition-colors !mt-12">{submittingContribution ? 'Logging...' : 'Log Contribution'}</button>
              </form>
            </div>

            {/* Add Merry-Go-Round Round */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Schedule Round</h3>
              <form onSubmit={handleAddRoundSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Round Number</label>
                    <input type="number" required value={newRound.roundNumber} onChange={(e) => setNewRound(p => ({ ...p, roundNumber: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="1" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                    <select value={newRound.status} onChange={(e) => setNewRound(p => ({ ...p, status: e.target.value as any }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                      <option value="Upcoming">Upcoming</option>
                      <option value="Current">Current</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Recipient Name</label>
                  <input type="text" required value={newRound.recipientName} onChange={(e) => setNewRound(p => ({ ...p, recipientName: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="Recipient user name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Payout Amount ($)</label>
                  <input type="number" required value={newRound.payoutAmount} onChange={(e) => setNewRound(p => ({ ...p, payoutAmount: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="12000" />
                </div>
                <button type="submit" disabled={submittingRound} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2 rounded-xl transition-colors">{submittingRound ? 'Scheduling...' : 'Commit Round'}</button>
              </form>
            </div>
          </div>

          {/* Editable Member Tracker Module */}
          <Module
              title="Member Tracker"
              content={
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead>
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Identity Details</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Communication</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Insurance Amount</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-400">Status</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-slate-400">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                    {members.map((member) => {
                      const isEditing = editingMemberId === member.id;
                      return (
                          <tr key={member.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-3 px-4">
                              {isEditing ? (
                                  <input type="text" name="name" value={editForm.name || ''} onChange={handleInputChange} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-500 mb-1 block" />
                              ) : (
                                  <span className="font-semibold text-white block">{member.name}</span>
                              )}
                              <span className="text-xs text-slate-500">Joined: {member.joinDate}</span>
                            </td>

                            <td className="py-3 px-4 text-sm">
                              {isEditing ? (
                                  <>
                                    <input type="email" name="email" value={editForm.email || ''} onChange={handleInputChange} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 mb-1 block w-full" placeholder="Email" />
                                    <input type="text" name="contact" value={editForm.contact || ''} onChange={handleInputChange} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 block w-full" placeholder="Contact" />
                                  </>
                              ) : (
                                  <>
                                    <span className="text-slate-300 block">{member.email || '--'}</span>
                                    <span className="text-xs text-slate-500 block">{member.contact || '--'}</span>
                                  </>
                              )}
                            </td>

                            <td className="py-3 px-4 text-sm">
                              {isEditing ? (
                                  <input type="number" name="insurancePaid" value={editForm.insurancePaid ?? 0} onChange={handleInputChange} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-500 w-28" />
                              ) : (
                                  <span className="text-emerald-300 font-medium">{formatCurrency(member.insurancePaid)}</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-sm">
                              {isEditing ? (
                                  <select name="status" value={editForm.status || 'Pending'} onChange={handleInputChange} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-500">
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                  </select>
                              ) : (
                                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                      member.status === 'Paid' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'
                                  }`}>
                              {member.status}
                            </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right text-sm font-medium">
                              {isEditing ? (
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => saveMemberChanges(member.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded-lg transition-colors">Save</button>
                                    <button onClick={() => setEditingMemberId(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-lg transition-colors">Cancel</button>
                                  </div>
                              ) : (
                                  <div className="flex justify-end gap-3 items-center">
                                    <button onClick={() => startEditing(member)} className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold underline">Edit</button>
                                    <button onClick={() => handleDeleteMember(member.id)} className="text-rose-400 hover:text-rose-300 text-xs font-semibold underline">Delete</button>
                                  </div>
                              )}
                            </td>
                          </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              }
          />
        </main>
      </div>
  );
}