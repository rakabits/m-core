import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { listClassEnrollments, assignStudent } from '@/modules/academic/assignment';
import { z } from 'zod';
async function actor(){const s=await createSupabaseServerClient();return (await s.auth.getUser()).data.user}
const schema=z.object({historyId:z.string().uuid(),classId:z.string().uuid()});
export async function GET(r:NextRequest){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'class.view')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});return NextResponse.json({success:true,data:await listClassEnrollments(r.nextUrl.searchParams.get('classId')||undefined)})}
export async function POST(r:NextRequest){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'class.manage')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});const p=schema.safeParse(await r.json());if(!p.success)return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR'}},{status:422});try{return NextResponse.json({success:true,data:await assignStudent(p.data,u.id)},{status:201})}catch(e){const x=e as {status?:number;message?:string};if(x.status)return NextResponse.json({success:false,error:{code:x.message}},{status:x.status});throw e}}
