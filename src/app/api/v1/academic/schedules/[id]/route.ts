import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/modules/rbac/authorization';
import { cancelSchedule, saveSchedule } from '@/modules/academic/schedules';
const schema=z.object({classId:z.string().uuid(),subjectId:z.string().uuid(),teacherId:z.string().uuid(),day:z.number().int().min(1).max(7),startTime:z.string().regex(/^\d{2}:\d{2}$/),endTime:z.string().regex(/^\d{2}:\d{2}$/),room:z.string().max(100).nullable().optional()});
async function user(){const s=await createSupabaseServerClient();return (await s.auth.getUser()).data.user}
export async function PATCH(r:NextRequest,c:{params:Promise<{id:string}>}){const u=await user();if(!u)return NextResponse.json({success:false,error:{code:'UNAUTHORIZED'}},{status:401});if(!(await hasPermission(u.id,'schedule.manage')))return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});const id=(await c.params).id;if(r.nextUrl.searchParams.get('action')==='cancel')return NextResponse.json({success:true,data:await cancelSchedule(id,u.id)});const p=schema.safeParse(await r.json());if(!p.success)return NextResponse.json({success:false,error:{code:'VALIDATION_ERROR'}},{status:422});return NextResponse.json({success:true,data:await saveSchedule(p.data,u.id,id)})}
