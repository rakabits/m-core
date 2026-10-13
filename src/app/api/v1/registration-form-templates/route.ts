import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';

const OPTIONAL_FIELDS = ['nisn', 'familyCardNumber', 'passportNumber', 'phone', 'telegramUsername', 'addressLine', 'addressRt', 'addressRw', 'village', 'district', 'cityRegency', 'province', 'postalCode', 'heightCm', 'weightKg', 'siblingCount', 'birthOrder', 'fatherFullName', 'fatherNik', 'fatherBirthPlace', 'fatherBirthDate', 'fatherPhone', 'fatherEducation', 'fatherOccupation', 'fatherMonthlyIncome', 'motherFullName', 'motherNik', 'motherBirthPlace', 'motherBirthDate', 'motherPhone', 'motherEducation', 'motherOccupation', 'motherMonthlyIncome', 'guardianData', 'educationSd', 'educationSmp', 'educationSma', 'educationS1', 'educationS2', 'educationS3', 'notes'] as const;
const cleanFields = (value: unknown) => Array.from(new Set(['photo', ...(Array.isArray(value) ? value.filter((field): field is string => typeof field === 'string' && OPTIONAL_FIELDS.includes(field as typeof OPTIONAL_FIELDS[number])) : [])]));

export async function GET() {
  try {
    const data = await prisma.registrationFormTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ success: true, data, fields: OPTIONAL_FIELDS });
  } catch (error) {
    console.error('[GET /api/v1/registration-form-templates]', error);
    return NextResponse.json({ success: false, error: { code: 'TEMPLATE_LIST_FAILED', message: 'Template formulir gagal dimuat. Silakan coba lagi.' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 150) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Nama template wajib diisi.' } }, { status: 422 });
  const selectedFields = cleanFields(body.selectedFields);
  try {
    const data = await prisma.registrationFormTemplate.create({ data: { name, selectedFields } });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ success: false, error: { code: 'DUPLICATE_TEMPLATE', message: 'Nama template sudah digunakan.' } }, { status: 409 });
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
