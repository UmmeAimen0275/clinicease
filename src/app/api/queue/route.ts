import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayRangePK } from "@/lib/day";

export const dynamic = "force-dynamic"; // never cache: always fresh

export async function GET() {
  const { start, end } = todayRangePK();
  const doctors = await prisma.doctor.findMany({
    include: {
      user: { select: { name: true } },
      // PRIVACY: only token numbers leave the server, no patient names
      appointments: {
        where: { slotStart: { gte: start, lt: end }, status: "CHECKED_IN" },
        select: { token: true },
        orderBy: { token: "asc" },
      },
    },
  });

  return NextResponse.json(
    doctors.map((d) => {
      const tokens = d.appointments.map((a) => a.token!);
      return {
        id: d.id,
        name: d.user.name,
        specialty: d.specialty,
        serving: tokens[0] ?? null,
        waiting: tokens.slice(1),
      };
    })
  );
}