import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';import { listAcademicYears, createAcademicYear } from '@/modules/academic/service';
import { academicYearCreateSchema } from '@/modules/academic/validation';
async function actor(){const s=await createSupabaseServerClient();return (await s.auth.getUser()).data.user}
export async function GET(){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'academic_year.view')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});return NextResponse.json({success:true,data:await listAcademicYears()})}
export async function POST(r:NextRequest){const u=await actor();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'academic_year.manage')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});const p=academicYearCreateSchema.safeParse(await r.json());if(!p.success)return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR'}},{status:422});try{return NextResponse.json({success:true,data:await createAcademicYear(p.data,u.id)},{status:201})}catch(e){if((e as {code?:string})?.code==='P2002')return NextResponse.json({success:false,error:{code:'DUPLICATE_ACADEMIC_YEAR'}},{status:409});throw e}

}

