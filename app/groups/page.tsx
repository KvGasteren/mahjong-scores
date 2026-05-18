"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Group = {
  id: string;
  name: string;
  role?: string;
  createdAt: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => { setGroups(data); setLoading(false); });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Groups</h1>
        <Link
          href="/groups/new"
          className="rounded-xl bg-black text-white px-4 py-2 text-sm cursor-pointer"
        >
          New group
        </Link>
      </div>

      {loading && <p className="text-neutral-400 text-sm">Loading…</p>}

      {!loading && groups.length === 0 && (
        <p className="text-neutral-400 text-sm">
          You are not in any group yet.{" "}
          <Link href="/groups/new" className="underline">Create one.</Link>
        </p>
      )}

      <ul className="space-y-2">
        {groups.map((g) => (
          <li key={g.id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
            <span className="font-medium">{g.name}</span>
            {g.role && (
              <span className="text-xs text-neutral-400 capitalize">{g.role}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
