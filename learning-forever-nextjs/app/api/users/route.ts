import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, whatsapp } = body;

    // At least one contact method must be provided
    if (!email && !whatsapp) {
      return NextResponse.json(
        { error: 'Email or WhatsApp number is required' },
        { status: 400 }
      );
    }

    // Check if user already exists by email or whatsapp
    const whereConditions = [];
    if (email) whereConditions.push({ email });
    if (whatsapp) whereConditions.push({ whatsapp });

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
      },
    });

    if (existingUser) {
      // Update existing user with latest data
      const user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name || existingUser.name,
          email: email || existingUser.email,
          whatsapp: whatsapp || existingUser.whatsapp,
        },
      });

      console.log('Found and updated existing user:', user.id);
      return NextResponse.json(user);
    }

    // Create new user only if not found
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: email || null,
        whatsapp: whatsapp || null,
      },
    });

    console.log('Created new user:', user.id);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
