import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { updateSubject } from '@/modules/academic/service';
import { subjectUpdateSchema } from '@/modules/academic/validation';
async function actor(){const s=await createSupabaseServerClient();return (await s.auth.getUser()).data.user}
export async function PATCH(r:NextRequest,c:{params:Promise<{id:string}>}){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'subject.manage')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});const p=subjectUpdateSchema.safeParse(await r.json());if(!p.success)return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR'}},{status:422});try{return NextResponse.json({success:true,data:await updateSubject((await c.params).id,p.data,u.id)})}catch(e){const code=(e as {code?:string})?.code;if(code==='P2025')return NextResponse.json({success:false,error:{code:'NOT_FOUND'}},{status:404});if(code==='P2002')return NextResponse.json({success:false,error:{code:'DUPLICATE_SUBJECT'}},{status:409});throw e}}
