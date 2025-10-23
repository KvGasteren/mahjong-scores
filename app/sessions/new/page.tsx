"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewSessionPage() {
  const r = useRouter();
  const [title, setTitle] = useState("");
  const [players, setPlayers] = useState(["", "", "", ""]);
  const [playDate, setPlayDate] = useState(() => new Date().toISOString().slice(0,10)); // YYYY-MM-DD

  async function onCreate() {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, players, playDate }),
    });
    if (!res.ok) {
      alert("Failed to create session");
      return;
    }
    const s = await res.json();
    r.push(`/sessions/${s.id}`);
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">New Session</h1>
      <input className="w-full border rounded-xl px-3 py-2" placeholder="Title"
        value={title} onChange={(e)=>setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        {players.map((val, i)=>(
          <input key={i} className="w-full border rounded-xl px-3 py-2"
            placeholder={`Player ${i+1}`} value={val}
            onChange={(e)=>{
              const next = [...players]; next[i]=e.target.value; setPlayers(next);
            }} />
        ))}
      </div>
      <input type="date" className="w-full border rounded-xl px-3 py-2"
        value={playDate} onChange={(e)=>setPlayDate(e.target.value)} />
      <button className="w-full rounded-2xl bg-black text-white py-3 disabled:opacity-50"
        disabled={!title || players.some(p=>!p) || !playDate}
        onClick={onCreate}>
        Create
      </button>
    </div>
  );
}
