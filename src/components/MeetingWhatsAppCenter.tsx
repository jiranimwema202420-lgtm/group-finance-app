"use client";

import React, { useEffect, useMemo, useState } from "react";

type MeetingStatus = "Scheduled" | "Notified" | "Done";

type MeetingTemplate = {
  id: string;
  title: string;
  agenda: string;
  venue: string;
  reminderMinutes: number;
};

type Meeting = {
  id: string;
  templateId: string;
  title: string;
  agenda: string;
  venue: string;
  date: string;
  time: string;
  reminderMinutes: number;
  status: MeetingStatus;
};

const STORAGE_KEY = "jirani-meeting-notifications-v1";

const templates: MeetingTemplate[] = [
  {
    id: "monthly-general",
    title: "Monthly General Meeting",
    agenda: "Review contributions, welfare, merry-go-round, insurance, arrears, and member issues.",
    venue: "Group meeting venue / WhatsApp group",
    reminderMinutes: 1440,
  },
  {
    id: "finance-review",
    title: "Treasurer Finance Review",
    agenda: "Review payments, arrears, pending verifications, member statements, and reports.",
    venue: "Treasurer/Admin review",
    reminderMinutes: 720,
  },
  {
    id: "welfare",
    title: "Welfare & Bereavement Meeting",
    agenda: "Review welfare requests, bereavement cases, family support balances, and follow-ups.",
    venue: "Committee meeting venue / WhatsApp group",
    reminderMinutes: 1440,
  },
  {
    id: "insurance",
    title: "Insurance & Claims Check",
    agenda: "Review insurance premiums, claims, missing details, and upcoming deadlines.",
    venue: "Insurance review desk",
    reminderMinutes: 1440,
  },
  {
    id: "admin-approval",
    title: "Admin Access Approval Review",
    agenda: "Review access requests, role assignments, member data corrections, and audit log issues.",
    venue: "Admin dashboard",
    reminderMinutes: 360,
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeMeeting(template = templates[0]): Meeting {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    templateId: template.id,
    title: template.title,
    agenda: template.agenda,
    venue: template.venue,
    date: today(),
    time: "19:00",
    reminderMinutes: template.reminderMinutes,
    status: "Scheduled",
  };
}

function meetingDate(meeting: Meeting) {
  return new Date(`${meeting.date}T${meeting.time}:00`);
}

function reminderDate(meeting: Meeting) {
  return new Date(meetingDate(meeting).getTime() - meeting.reminderMinutes * 60_000);
}

function formatMeetingDate(meeting: Meeting) {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(meetingDate(meeting));
}

function getReminderLabel(minutes: number) {
  if (minutes < 60) return `${minutes} minutes before`;
  if (minutes === 60) return "1 hour before";
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours before`;
  if (minutes === 1440) return "3 day before";
  return `${Math.round(minutes / 1440)} days before`;
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) return `254${digits}`;

  return digits;
}

function whatsappUrl(phone: string, message: string) {
  const number = normalizePhone(phone);
  const text = encodeURIComponent(message);

  if (!number) return `https://wa.me/?text=${text}`;

  return `https://wa.me/${number}?text=${text}`;
}

function buildMessage(meeting: Meeting) {
  return [
    "*Jirani Mwema SHG monthly Meeting Reminder*",
    "",
    `Meeting: ${meeting.title}`,
    `Date & Time: ${formatMeetingDate(meeting)}`,
    `Venue/Link: ${meeting.venue || "To be confirmed"}`,
    "",
    "Agenda:",
    meeting.agenda,
    "",
    "Please attend on time 3.00 pm. If you are unable to attend, inform the Chairman/Admin/Treasurer early.",
    "",
    "- Jirani Mwema SHG Finance Portal",
  ].join("\n");
}

export default function MeetingWhatsAppCenter() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [contactsText, setContactsText] = useState("");
  const [notice, setNotice] = useState("");
  const [autoCheck, setAutoCheck] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const savedContacts = window.localStorage.getItem(`${STORAGE_KEY}-contacts`);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Meeting[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMeetings(parsed);
          setSelectedId(parsed[0].id);
        } else {
          const initial = makeMeeting();
          setMeetings([initial]);
          setSelectedId(initial.id);
        }
      } catch {
        const initial = makeMeeting();
        setMeetings([initial]);
        setSelectedId(initial.id);
      }
    } else {
      const initial = makeMeeting();
      setMeetings([initial]);
      setSelectedId(initial.id);
    }

    if (savedContacts) setContactsText(savedContacts);
  }, []);

  useEffect(() => {
    if (meetings.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
    }
  }, [meetings]);

  useEffect(() => {
    window.localStorage.setItem(`${STORAGE_KEY}-contacts`, contactsText);
  }, [contactsText]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const selected = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedId) ?? meetings[0],
    [meetings, selectedId]
  );

  const contacts = useMemo(
    () => contactsText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    [contactsText]
  );

  const dueMeetings = useMemo(
    () =>
      meetings.filter((meeting) => {
        if (meeting.status === "Done" || meeting.status === "Notified") return false;

        const reminderAt = reminderDate(meeting).getTime();
        const meetingAt = meetingDate(meeting).getTime();
        const current = now.getTime();

        return current >= reminderAt && current <= meetingAt;
      }),
    [meetings, now]
  );

  useEffect(() => {
    if (!autoCheck || dueMeetings.length === 0) return;

    const due = dueMeetings[0];
    setNotice(`Reminder due: ${due.title}`);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Jirani Mwema Meeting Reminder", {
        body: `${due.title} at ${formatMeetingDate(due)}`,
      });
    }
  }, [autoCheck, dueMeetings]);

  if (!selected) {
    return (
      <main className="min-h-dvh bg-slate-950 p-6 text-white">
        Loading meeting notifications...
      </main>
    );
  }

  const message = buildMessage(selected);

  const updateMeeting = (patch: Partial<Meeting>) => {
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id === selected.id ? { ...meeting, ...patch } : meeting
      )
    );
  };

  const changeTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    updateMeeting({
      templateId: template.id,
      title: template.title,
      agenda: template.agenda,
      venue: template.venue,
      reminderMinutes: template.reminderMinutes,
    });
  };

  const addMeeting = () => {
    const meeting = makeMeeting();
    setMeetings((current) => [meeting, ...current]);
    setSelectedId(meeting.id);
  };

  const deleteMeeting = () => {
    const remaining = meetings.filter((meeting) => meeting.id !== selected.id);

    if (remaining.length === 0) {
      const initial = makeMeeting();
      setMeetings([initial]);
      setSelectedId(initial.id);
      return;
    }

    setMeetings(remaining);
    setSelectedId(remaining[0].id);
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setNotice("This browser does not support notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setNotice(result === "granted" ? "Browser notifications enabled." : "Notification permission denied.");
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setNotice("Meeting message copied.");
  };

  const shareMessage = async () => {
    if (navigator.share) {
      await navigator.share({
        title: selected.title,
        text: message,
      });
      return;
    }

    await copyMessage();
  };

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_34%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 ring-1 ring-white/10 backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            Jirani Mwema SHG
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Meeting WhatsApp Notifications
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Schedule predefined meetings, generate WhatsApp-ready reminders, and receive browser alerts while the app is open.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href="/" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-slate-100 hover:bg-white/[0.14]">
                Dashboard
              </a>
              <button type="button" onClick={addMeeting} className="rounded-2xl border border-cyan-300/25 bg-cyan-400/20 px-4 py-3 text-sm font-black text-cyan-50 hover:bg-cyan-400/30">
                Add Meeting
              </button>
            </div>
          </div>

          {notice ? (
            <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">
              {notice}
            </div>
          ) : null}

          {dueMeetings.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 text-amber-100">
              <p className="font-black">Reminder due now</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {dueMeetings.map((meeting) => (
                  <li key={meeting.id}>{meeting.title} — {formatMeetingDate(meeting)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/10 backdrop-blur-2xl">
            <h2 className="text-xl font-black text-white">Meeting Setup</h2>

            <label className="mt-4 block text-sm font-black text-slate-200">
              Select meeting
              <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40">
                {meetings.map((meeting) => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.title} — {meeting.date} {meeting.time}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-black text-slate-200">
              Predefined meeting
              <select value={selected.templateId} onChange={(event) => changeTemplate(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40">
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-black text-slate-200">
              Meeting title
              <input value={selected.title} onChange={(event) => updateMeeting({ title: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40" />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-black text-slate-200">
                Date
                <input type="date" value={selected.date} onChange={(event) => updateMeeting({ date: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40" />
              </label>

              <label className="block text-sm font-black text-slate-200">
                Time
                <input type="time" value={selected.time} onChange={(event) => updateMeeting({ time: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40" />
              </label>
            </div>

            <label className="mt-4 block text-sm font-black text-slate-200">
              Reminder
              <select value={selected.reminderMinutes} onChange={(event) => updateMeeting({ reminderMinutes: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40">
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={360}>6 hours before</option>
                <option value={720}>12 hours before</option>
                <option value={1440}>1 day before</option>
                <option value={2880}>2 days before</option>
              </select>
            </label>

            <label className="mt-4 block text-sm font-black text-slate-200">
              Venue / Link
              <input value={selected.venue} onChange={(event) => updateMeeting({ venue: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40" />
            </label>

            <label className="mt-4 block text-sm font-black text-slate-200">
              Agenda
              <textarea value={selected.agenda} onChange={(event) => updateMeeting({ agenda: event.target.value })} rows={5} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-cyan-300/40" />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={requestNotifications} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-slate-100 hover:bg-white/[0.14]">
                Enable Browser Alerts
              </button>
              <button type="button" onClick={() => setAutoCheck((value) => !value)} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-slate-100 hover:bg-white/[0.14]">
                Auto Check: {autoCheck ? "On" : "Off"}
              </button>
              <button type="button" onClick={deleteMeeting} className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-black text-rose-100 hover:bg-rose-400/20">
                Delete
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 ring-1 ring-white/10 backdrop-blur-2xl">
            <h2 className="text-xl font-black text-white">WhatsApp Message</h2>

            <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-slate-300">
              <p>Meeting: <strong className="text-white">{formatMeetingDate(selected)}</strong></p>
              <p>Reminder: <strong className="text-white">{getReminderLabel(selected.reminderMinutes)}</strong></p>
              <p>
                Reminder starts:{" "}
                <strong className="text-white">
                  {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(reminderDate(selected))}
                </strong>
              </p>
            </div>

            <label className="mt-4 block text-sm font-black text-slate-200">
              WhatsApp numbers, one per line
              <textarea value={contactsText} onChange={(event) => setContactsText(event.target.value)} rows={6} placeholder={"0717813772\n254700000000"} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-cyan-300/40" />
            </label>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/75 p-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyMessage} className="rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-black text-slate-100 hover:bg-white/[0.14]">
                  Copy
                </button>
                <button type="button" onClick={shareMessage} className="rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-black text-slate-100 hover:bg-white/[0.14]">
                  Share
                </button>
                <a href={whatsappUrl("", message)} target="_blank" rel="noreferrer" className="rounded-xl border border-emerald-300/25 bg-emerald-400/15 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-400/25">
                  Open WhatsApp
                </a>
              </div>

              <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-slate-200">
                {message}
              </pre>
            </div>

            <div className="mt-4">
              <p className="text-sm font-black text-slate-200">
                Send to members ({contacts.length})
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {contacts.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-400">
                    Add phone numbers to generate individual WhatsApp links.
                  </p>
                ) : (
                  contacts.map((phone) => (
                    <a key={phone} href={whatsappUrl(phone, message)} target="_blank" rel="noreferrer" className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-400/20">
                      WhatsApp {phone}
                    </a>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => updateMeeting({ status: "Notified" })} className="rounded-2xl border border-cyan-300/25 bg-cyan-400/20 px-4 py-3 text-sm font-black text-cyan-50 hover:bg-cyan-400/30">
                Mark Notified
              </button>
              <button type="button" onClick={() => updateMeeting({ status: "Done" })} className="rounded-2xl border border-emerald-300/25 bg-emerald-400/15 px-4 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-400/25">
                Mark Done
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              <strong>Production note:</strong> This version creates WhatsApp-ready links and browser reminders. Fully automatic background sending requires WhatsApp Business API, approved templates, secure backend credentials, and a scheduled server job.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
