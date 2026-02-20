import { NextRequest, NextResponse } from "next/server";
import { leadService } from "@/services/lead";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { siteId, name, email, phone, message, service, preferredDate, preferredTime, source, variant } = body;

    if (!siteId || !name || !email) {
      return NextResponse.json(
        { success: false, error: "siteId, name and email are required" },
        { status: 400 }
      );
    }

    // Build message from individual booking fields if no direct message
    let fullMessage = message || "";
    const extras: string[] = [];
    if (service) extras.push(`Service: ${service}`);
    if (preferredDate) extras.push(`Date: ${preferredDate}`);
    if (preferredTime) extras.push(`Time: ${preferredTime}`);
    if (source) extras.push(`Source: ${source}`);
    if (extras.length && !fullMessage) fullMessage = extras.join("\n");
    else if (extras.length) fullMessage = `${fullMessage}\n\n${extras.join("\n")}`;

    await leadService.createLead({
      siteId,
      name,
      email,
      phone: phone || undefined,
      message: fullMessage || undefined,
      variant: variant || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/leads] Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
