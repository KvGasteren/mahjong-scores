"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Group = { id: string; name: string };
type GroupMember = { seatIndex: number; name: string; userId: string | null };

export default function NewSessionPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [title, setTitle] = useState("");
  const [playDate, setPlayDate] = useState(() => new Date().toISOString().slice(0, 10));

  const dateFormatter = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" });

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data: Group[]) => {
        setGroups(data);
        if (data.length === 1) setGroupId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!groupId) { setMembers([]); return; }
    fetch(`/api/groups/${groupId}/members`)
      .then((r) => r.json())
      .then(setMembers);
  }, [groupId]);

  async function onCreate() {
    const filledTitle = title.trim() || dateFormatter.format(new Date(playDate));
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: filledTitle, playDate, groupId: groupId || null }),
    });
    if (!res.ok) {
      alert("Failed to create session");
      return;
    }
    const s = await res.json();
    router.push(`/sessions/${s.id}`);
  }

  const canCreate = !!groupId && members.length === 4;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">New Session</h1>

      {groups.length > 1 && (
        <select
          className="w-full border rounded-xl px-3 py-2 bg-white cursor-pointer"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        >
          <option value="">Select a group…</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      )}

      {members.length === 4 && (
        <div className="rounded-xl border border-neutral-200 px-4 py-3">
          <p className="text-sm text-neutral-500 mb-2">Players</p>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {members.map((m) => (
              <span key={m.seatIndex} className="font-medium">{m.name}</span>
            ))}
          </div>
        </div>
      )}

      <input
        className="w-full border rounded-xl px-3 py-2"
        placeholder={`Title [${dateFormatter.format(new Date(playDate))}]`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="date"
        className="w-full border rounded-xl px-3 py-2"
        value={playDate}
        onChange={(e) => setPlayDate(e.target.value)}
      />

      <button
        className="w-full rounded-2xl bg-black text-white py-3 disabled:opacity-50 cursor-pointer"
        onClick={onCreate}
        disabled={!canCreate}
      >
        Create
      </button>
    </div>
  );
}
