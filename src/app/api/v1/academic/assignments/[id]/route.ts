import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { endAssignment } from '@/modules/academic/assignment';
async function actor(){const s=await createSupabaseServerClient();return (await s.auth.getUser()).data.user}
export async function PATCH(_r:Request,c:{params:Promise<{id:string}>}){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'class.manage')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});try{return NextResponse.json({success:true,data:await endAssignment((await c.params).id,u.id)})}catch(e){if((e as {code?:string})?.code==='P2025')return NextResponse.json({success:false,error:{code:'NOT_FOUND'}},{status:404});throw e}}
