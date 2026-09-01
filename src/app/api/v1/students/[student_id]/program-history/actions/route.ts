import { NextRequest,NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { historyCreateSchema } from '@/modules/program-history/validation';
import { promoteStudent,transferStudent } from '@/modules/program-history/service';
import type { HistoryCreateInput } from '@/modules/program-history/service';
type ActionInput=Omit<HistoryCreateInput,'status'|'endDate'|'notes'>;
async function actor(){const s=await createSupabaseServerClient();return (await s.auth.getUser()).data.user}
async function run(r:NextRequest,c:{params:Promise<{student_id:string}>},permission:string,fn:(id:string,data:ActionInput,actor:string)=>Promise<unknown>){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,permission)))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});const p=historyCreateSchema.omit({status:true,endDate:true,notes:true}).safeParse(await r.json());if(!p.success)return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR'}},{status:422});try{const {student_id}=await c.params;return NextResponse.json({success:true,data:await fn(student_id,p.data,u.id)},{status:201})}catch(e:unknown){const status=(e as {status?:number})?.status;if(status===422)return NextResponse.json({success:false,error:{code:(e as Error).message}},{status:422});throw e}}
export async function POST(r:NextRequest,c:{params:Promise<{student_id:string}>}){const action=r.nextUrl.searchParams.get('action');return run(r,c,action==='transfer'?'student.transfer':'student.promote',action==='transfer'?transferStudent:promoteStudent)}

