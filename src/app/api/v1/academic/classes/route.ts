import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';import { listClasses, createClass } from '@/modules/academic/service';
import { classCreateSchema } from '@/modules/academic/validation';
async function actor(){const s=await createSupabaseServerClient();return (await s.auth.getUser()).data.user}
export async function GET(){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'class.view')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});return NextResponse.json({success:true,data:await listClasses()})}
export async function POST(r:NextRequest){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'class.manage')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});const p=classCreateSchema.safeParse(await r.json());if(!p.success)return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR'}},{status:422});try{return NextResponse.json({success:true,data:await createClass(p.data,u.id)},{status:201})}catch(e){if((e as {code?:string})?.code==='P2002')return NextResponse.json({success:false,error:{code:'DUPLICATE_CLASS'}},{status:409});throw e}

}

