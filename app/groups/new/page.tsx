"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type KnownUser = { id: string; name: string | null; email: string | null };

type Seat = { userId: string | null; name: string };

function SeatInput({
  index,
  seat,
  knownUsers,
  onChange,
}: {
  index: number;
  seat: Seat;
  knownUsers: KnownUser[];
  onChange: (seat: Seat) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-neutral-500">Seat {index + 1}</label>
      <select
        className="w-full border rounded-xl px-3 py-2 bg-white cursor-pointer"
        value={seat.userId ?? "__name__"}
        onChange={(e) => {
          if (e.target.value === "__name__") {
            onChange({ userId: null, name: seat.name });
          } else {
            const u = knownUsers.find((u) => u.id === e.target.value);
            onChange({ userId: e.target.value, name: u?.name ?? u?.email ?? "" });
          }
        }}
      >
        <option value="__name__">Enter name…</option>
        {knownUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name ?? u.email}
          </option>
        ))}
      </select>
      {seat.userId === null && (
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder={`Player name`}
          value={seat.name}
          onChange={(e) => onChange({ userId: null, name: e.target.value })}
        />
      )}
    </div>
  );
}

export default function NewGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [knownUsers, setKnownUsers] = useState<KnownUser[]>([]);
  const [seats, setSeats] = useState<Seat[]>(
    Array.from({ length: 4 }, () => ({ userId: null, name: "" }))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setKnownUsers);
  }, []);

  function updateSeat(index: number, seat: Seat) {
    setSeats((prev) => prev.map((s, i) => (i === index ? seat : s)));
  }

  async function onCreate() {
    if (!groupName.trim()) return;
    setLoading(true);

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: groupName.trim(),
        seats: seats.map((s, i) => ({ seatIndex: i, name: s.name.trim(), userId: s.userId })),
      }),
    });

    if (!res.ok) {
      alert("Failed to create group");
      setLoading(false);
      return;
    }
    router.push("/groups");
  }

  const canCreate =
    groupName.trim() &&
    seats.every((s) => s.userId || s.name.trim());

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">New Group</h1>

      <input
        className="w-full border rounded-xl px-3 py-2"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        autoFocus
      />

      <p className="text-sm text-neutral-500">
        A group has exactly 4 players. Select a registered user or enter a name for each seat.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {seats.map((seat, i) => (
          <SeatInput
            key={i}
            index={i}
            seat={seat}
            knownUsers={knownUsers}
            onChange={(s) => updateSeat(i, s)}
          />
        ))}
      </div>

      <button
        className="w-full rounded-2xl bg-black text-white py-3 disabled:opacity-50 cursor-pointer"
        onClick={onCreate}
        disabled={!canCreate || loading}
      >
        {loading ? "Creating…" : "Create group"}
      </button>
    </div>
  );
}
