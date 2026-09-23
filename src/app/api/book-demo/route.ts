import { NextResponse } from "next/server";

export interface DemoRequestBody {
  fullName: string;
  email: string;
  phone: string;
  interest?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
}

export async function POST(req: Request) {
  try {
    const body: DemoRequestBody = await req.json();
    const { fullName, email, phone, interest, preferredDate, preferredTime, message } = body;

    // Validate required fields
    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { success: false, error: "Full Name is required." },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    const recipientEmail = process.env.OWNER_EMAIL || process.env.DEMO_NOTIFICATION_EMAIL || "business@atlusindia.com";
    const leadData = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      interest: interest || "Algorithmic Trading & Automation",
      preferredDate: preferredDate || "As soon as possible",
      preferredTime: preferredTime || "Flexible",
      message: message?.trim() || "No additional note provided",
      timestamp: new Date().toISOString(),
      recipientEmail,
    };

    // Log the lead for administrative / audit trail
    console.log("==========================================");
    console.log("🚀 NEW DEMO BOOKING SUBMISSION RECEIVED:");
    console.log(JSON.stringify(leadData, null, 2));
    console.log("==========================================");

    // Optional webhook forwarding if WEBHOOK_URL is configured
    const webhookUrl = process.env.DEMO_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🎯 **New Demo Booking Request**\n**Name:** ${leadData.fullName}\n**Email:** ${leadData.email}\n**Phone:** ${leadData.phone}\n**Interest:** ${leadData.interest}\n**Preferred Slot:** ${leadData.preferredDate} (${leadData.preferredTime})\n**Message:** ${leadData.message}`,
            lead: leadData,
          }),
        });
      } catch (err) {
        console.error("Failed to forward demo lead to webhook:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your demo booking request has been submitted successfully! Our executive will reach out to you shortly.",
      lead: {
        fullName: leadData.fullName,
        email: leadData.email,
        preferredDate: leadData.preferredDate,
        preferredTime: leadData.preferredTime,
      },
    });
  } catch (error: any) {
    console.error("Error processing demo booking:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while processing your request. Please try again." },
      { status: 500 }
    );
  }
}
