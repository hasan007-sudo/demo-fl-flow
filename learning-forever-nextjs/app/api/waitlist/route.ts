import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_PLAN_TYPES = ['starter', 'growth', 'professional'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, whatsapp, planType } = body;

    // Validate required fields
    if (!email || !planType) {
      return NextResponse.json(
        { error: 'Email and plan type are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!VALID_PLAN_TYPES.includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type. Must be starter, growth, or professional' },
        { status: 400 }
      );
    }

    // Look up existing user
    let user = null;
    if (email || whatsapp) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            email ? { email } : undefined,
            whatsapp ? { whatsapp } : undefined,
          ].filter(Boolean) as any,
        },
      });
    }

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || undefined,
          whatsapp: whatsapp || undefined,
        },
      });
    }

    // Create waitlist entry
    const waitlist = await prisma.waitlist.create({
      data: {
        userId: user.id,
        email,
        whatsapp: whatsapp || null,
        planType,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(waitlist, { status: 201 });
  } catch (error) {
    console.error('Error creating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}
