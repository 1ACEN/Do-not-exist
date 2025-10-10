import { NextRequest, NextResponse } from "next/server";

// Patients API disabled. Per project admin request, doctors should not manage
// a patients database directly here. Return 410 Gone for all methods so
// any accidental calls fail gracefully.

function gone() {
  return NextResponse.json({ error: "Patients API disabled" }, { status: 410 });
}

export async function GET(req: NextRequest) { return gone(); }
export async function POST(req: NextRequest) { return gone(); }
export async function PUT(req: NextRequest) { return gone(); }
export async function DELETE(req: NextRequest) { return gone(); }
