/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getScopes, hasPermission } from '@/modules/rbac/authorization';
import { studentCreateSchema } from '@/modules/students/validation';
import { createStudent, listStudents } from '@/modules/students/service';

async function actor() { const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); return user; }
export async function GET(request: NextRequest) { const user = await actor(); if (!user) return NextResponse.json({ success:false, error:{ code:'UNAUTHORIZED' } }, { status:401 }); if (!(await hasPermission(user.id, 'student.view'))) return NextResponse.json({ success:false, error:{ code:'FORBIDDEN' } }, { status:403 }); const q=request.nextUrl.searchParams; const page=Math.max(1, Number(q.get('page')||1)); const perPage=Math.min(100, Math.max(1, Number(q.get('per_page')||20))); const sensitive=await hasPermission(user.id,'student.view_sensitive'); const scope=await getScopes(user.id); const result=await listStudents({page,perPage,search:q.get('search')||undefined,status:(q.get('status') as any)||undefined,gender:(q.get('gender') as any)||undefined,sensitive,scope}); return NextResponse.json({success:true,...result}); }
export async function POST(request: NextRequest) { const user=await actor(); if(!user) return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401}); if(!(await hasPermission(user.id,'student.create'))) return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403}); const parsed=studentCreateSchema.safeParse(await request.json()); if(!parsed.success) return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR',details:z.treeifyError(parsed.error)}},{status:422}); try { const student=await createStudent(parsed.data,user.id); return NextResponse.json({success:true,data:{student_id:student.id,full_name:student.fullName,status:student.status}},{status:201}); } catch(error:any) { if(error.status===409) return NextResponse.json({success:false,error:{code:'DUPLICATE_NIK'}},{status:409}); throw error; } }





