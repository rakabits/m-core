import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';import { listSubjects, createSubject } from '@/modules/academic/service';
import { subjectCreateSchema } from '@/modules/academic/validation';
async function actor(){const s=await createSupabaseServerClient();return (await s.auth.getUser()).data.user}
export async function GET(){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'subject.view')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});return NextResponse.json({success:true,data:await listSubjects()})}
export async function POST(r:NextRequest){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'subject.manage')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});const p=subjectCreateSchema.safeParse(await r.json());if(!p.success)return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR'}},{status:422});try{return NextResponse.json({success:true,data:await createSubject(p.data,u.id)},{status:201})}catch(e){if((e as {code?:string})?.code==='P2002')return NextResponse.json({success:false,error:{code:'DUPLICATE_SUBJECT'}},{status:409});throw e}

}

