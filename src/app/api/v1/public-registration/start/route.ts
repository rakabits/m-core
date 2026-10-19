import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/core/database/prisma';

const makeCode = () =>
  randomBytes(6)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 8)
    .toLowerCase();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.enrollmentPeriodId) {
      return NextResponse.json(
        { success: false, error: { message: 'Periode pendaftaran wajib dipilih' } },
        { status: 422 }
      );
    }

    const period = await prisma.enrollmentPeriod.findUnique({
      where: { id: body.enrollmentPeriodId },
      include: { program: true, formTemplate: true },
    });

    if (!period || period.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: { message: 'Periode pendaftaran tidak sedang dibuka' } },
        { status: 422 }
      );
    }

    const registrationNo = `REG-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const publicToken = randomBytes(30).toString('hex');

    const applicant = await prisma.applicant.create({
      data: {
        registrationNo,
        publicToken,
        programId: period.programId,
        enrollmentPeriodId: period.id,
      },
      include: {
        program: true,
        enrollmentPeriod: true,
      },
    });

    const requestOrigin = request.headers.get('origin') || new URL(request.url).origin;
    const targetUrl = `${requestOrigin}/register/${publicToken}`;
    let shortCode = makeCode();

    for (let attempt = 0; attempt < 5; attempt++) {
      const exists = await prisma.$queryRaw<{ id: string }[]>(
        Prisma.sql`SELECT "id" FROM "Shortlink" WHERE "code"=${shortCode} LIMIT 1`
      );
      if (!exists.length) break;
      shortCode = makeCode();
    }

    try {
      await prisma.$queryRaw(
        Prisma.sql`INSERT INTO "Shortlink" ("id","title","targetUrl","code","createdAt","updatedAt") VALUES (${randomBytes(12).toString('hex')},${registrationNo},${targetUrl},${shortCode},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`
      );
    } catch (shortlinkErr) {
      console.warn('Failed to insert shortlink record:', shortlinkErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          publicToken,
          registrationNo,
          redirectUrl: `/register/${publicToken}`,
          shortlinkCode: shortCode,
          applicantId: applicant.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/public-registration/start]', error);
    return NextResponse.json(
      { success: false, error: { message: 'Gagal memulai formulir pendaftaran' } },
      { status: 500 }
    );
  }
}
