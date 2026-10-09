/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getScopes, hasPermission } from '@/modules/rbac/authorization';
import { studentCreateSchema } from '@/modules/students/validation';
import { createStudent, listStudents } from '@/modules/students/service';

async function actor() { const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); return user; }
export async function GET(request: NextRequest) { try { const user = await actor(); if (!user) return NextResponse.json({ success:false, error:{ code:'UNAUTHORIZED' } }, { status:401 }); if (!(await hasPermission(user.id, 'student.view'))) return NextResponse.json({ success:false, error:{ code:'FORBIDDEN' } }, { status:403 }); const q=request.nextUrl.searchParams; const page=Math.max(1, Number(q.get('page')||1)); const perPage=Math.min(100, Math.max(1, Number(q.get('per_page')||20))); const sensitive=await hasPermission(user.id,'student.view_sensitive'); const scope=await getScopes(user.id); const result=await listStudents({page,perPage,search:q.get('search')||undefined,status:(q.get('status') as any)||undefined,gender:(q.get('gender') as any)||undefined,institution:q.get('institution')||undefined,sensitive,scope}); return NextResponse.json({success:true,...result}); } catch(error:any) { console.error('[students.list] persistence failure', { code:error?.code, message:error?.message, meta:error?.meta }); return NextResponse.json({success:false,error:{code:'INTERNAL_ERROR'}},{status:500}); } }
export async function POST(request: NextRequest) { try { const user=await actor(); if(!user) return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401}); if(!(await hasPermission(user.id,'student.create'))) return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403}); const parsed=studentCreateSchema.safeParse(await request.json()); if(!parsed.success) return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR',details:z.treeifyError(parsed.error)}},{status:422}); const student=await createStudent(parsed.data,user.id); return NextResponse.json({success:true,data:{student_id:student.id,student_number:String(student.studentNumber).padStart(5,'0'),full_name:student.fullName,status:student.status}},{status:201}); } catch(error:any) { console.error('[students.create] persistence failure', { code: error?.code, message: error?.message, meta: error?.meta }); if(error?.status===409) return NextResponse.json({success:false,error:{code:error.message}},{status:409}); if(error?.status===422) return NextResponse.json({success:false,error:{code:error.message}},{status:422}); return NextResponse.json({success:false,error:{code:'INTERNAL_ERROR'}},{status:500}); } }





