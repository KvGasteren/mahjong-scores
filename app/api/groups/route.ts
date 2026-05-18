import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groups, groupMemberships, groupMembers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/apiAuth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.isSuperAdmin) {
    const rows = await db.select().from(groups).orderBy(groups.name);
    return NextResponse.json(rows);
  }

  const rows = await db
    .select({ id: groups.id, name: groups.name, createdAt: groups.createdAt, role: groupMemberships.role })
    .from(groupMemberships)
    .innerJoin(groups, eq(groupMemberships.groupId, groups.id))
    .where(eq(groupMemberships.userId, user.id))
    .orderBy(groups.name);

  return NextResponse.json(rows);
}

type SeatSpec = {
  seatIndex: number;  // 0–3
  name: string;       // display name
  userId: string | null; // null for named slots without an account
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, seats } = (await req.json()) as { name: string; seats: SeatSpec[] };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 });
  }
  if (!Array.isArray(seats) || seats.length !== 4) {
    return NextResponse.json({ error: "Exactly 4 seats are required" }, { status: 400 });
  }
  if (seats.some((s) => !s.name?.trim())) {
    return NextResponse.json({ error: "All seats must have a name" }, { status: 400 });
  }

  const [group] = await db.insert(groups).values({ name: name.trim() }).returning();

  // Insert 4 fixed seats
  await db.insert(groupMembers).values(
    seats.map((s) => ({
      groupId: group.id,
      seatIndex: s.seatIndex,
      name: s.name.trim(),
      userId: s.userId ?? null,
    }))
  );

  // Add registered users to group_memberships so permissions work
  const registeredSeats = seats.filter((s) => s.userId);
  if (registeredSeats.length > 0) {
    await db.insert(groupMemberships).values(
      registeredSeats.map((s) => ({
        userId: s.userId!,
        groupId: group.id,
        role: s.userId === user.id ? "admin" : "member",
      }))
    );
  } else {
    // Creator always gets admin membership even if not in a seat
    await db.insert(groupMemberships).values({ userId: user.id, groupId: group.id, role: "admin" });
  }

  return NextResponse.json(group, { status: 201 });
}
