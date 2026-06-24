"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Member = {
  seatIndex: number;
  name: string;
  userId: string | null;
  userImage: string | null;
};

type KnownUser = { id: string; name: string | null; email: string | null; image: string | null };

type Group = { id: string; name: string; role?: string };

function SeatCard({
  seat,
  groupId,
  knownUsers,
  linkedUserIds,
  isAdmin,
  onUpdated,
}: {
  seat: Member;
  groupId: string;
  knownUsers: KnownUser[];
  linkedUserIds: Set<string>;
  isAdmin: boolean;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(seat.name);
  const [saving, setSaving] = useState(false);

  async function patchSeat(body: { name?: string; userId?: string | null }) {
    setSaving(true);
    await fetch(`/api/groups/${groupId}/members/${seat.seatIndex}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    onUpdated();
  }

  async function saveName() {
    await patchSeat({ name: nameInput });
    setEditing(false);
  }

  function cancelEdit() {
    setNameInput(seat.name);
    setEditing(false);
  }

  const availableUsers = knownUsers.filter(
    (u) => !linkedUserIds.has(u.id) || u.id === seat.userId
  );

  return (
    <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">Seat {seat.seatIndex + 1}</span>
        {seat.userId ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Claimed</span>
        ) : (
          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">Unclaimed</span>
        )}
      </div>

      {editing ? (
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-xl px-3 py-1.5 text-sm"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") cancelEdit(); }}
          />
          <button
            onClick={saveName}
            disabled={saving || !nameInput.trim()}
            className="text-sm px-3 py-1.5 bg-black text-white rounded-xl disabled:opacity-50 cursor-pointer"
          >
            {saving ? "…" : "Save"}
          </button>
          <button onClick={cancelEdit} className="text-sm px-3 text-neutral-500 cursor-pointer">
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {seat.userImage && (
            <img src={seat.userImage} alt={seat.name} className="w-6 h-6 rounded-full" />
          )}
          <span className="font-medium">{seat.name}</span>
          {isAdmin && !seat.userId && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-neutral-400 hover:text-neutral-700 ml-auto cursor-pointer"
            >
              Rename
            </button>
          )}
        </div>
      )}

      {isAdmin && (
        <div>
          {seat.userId ? (
            <button
              onClick={() => patchSeat({ userId: null })}
              disabled={saving}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
            >
              Unlink user
            </button>
          ) : (
            <select
              className="w-full border rounded-xl px-3 py-1.5 text-sm bg-white cursor-pointer"
              value=""
              disabled={saving}
              onChange={(e) => { if (e.target.value) patchSeat({ userId: e.target.value }); }}
            >
              <option value="">Link to a user…</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const [groupName, setGroupName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [knownUsers, setKnownUsers] = useState<KnownUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadData = useCallback(async () => {
    const [groupsData, membersData, usersData] = await Promise.all([
      fetch("/api/groups").then((r) => r.json()),
      fetch(`/api/groups/${id}/members`).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);

    const group = groupsData.find((g: Group) => g.id === id);
    if (!group) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setGroupName(group.name);
    setIsAdmin(!group.role || group.role === "admin");
    setMembers(membersData);
    setKnownUsers(usersData);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <p className="text-neutral-400 text-sm">Loading…</p>;
  if (notFound) return <p className="text-neutral-400 text-sm">Group not found.</p>;

  const linkedUserIds = new Set(members.map((m) => m.userId).filter(Boolean) as string[]);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/groups" className="text-sm text-neutral-400 hover:text-neutral-700">
          ← Groups
        </Link>
        <h1 className="text-xl font-semibold">{groupName}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {members.map((seat) => (
          <SeatCard
            key={seat.seatIndex}
            seat={seat}
            groupId={id}
            knownUsers={knownUsers}
            linkedUserIds={linkedUserIds}
            isAdmin={isAdmin}
            onUpdated={loadData}
          />
        ))}
      </div>
    </div>
  );
}
