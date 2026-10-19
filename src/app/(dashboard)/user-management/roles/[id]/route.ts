import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/core/database/prisma';
async function actor(){const s=await createSupabaseServerClient();const {data:{user}}=await s.auth.getUser();if(!user)return null;const p=await prisma.userProfile.findUnique({where:{authId:user.id},include:{roles:{include:{role:true}}}});return p?.isActive&&p.roles.some(({role})=>role.name===UserRole.SUPER_ADMIN)?p:null}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const me=await actor();
  if(!me)return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});
  const {id}=await params;
  try{
    const role=await prisma.role.findUnique({where:{id},select:{id:true,name:true}});
    if(!role)return NextResponse.json({success:false,error:{code:'NOT_FOUND'}},{status:404});
    const b=await req.json();
    const codes: string[] = Array.isArray(b.permissionCodes) ? Array.from(new Set(b.permissionCodes.map((code: unknown) => String(code)))) : [];
    if(role.name===UserRole.SUPER_ADMIN&&codes.length===0)return NextResponse.json({success:false,error:{code:'SUPER_ADMIN_REQUIRES_PERMISSION'}},{status:422});
    const ps=await prisma.permission.findMany({where:{code:{in:codes}},select:{id:true,code:true}});
    if(ps.length!==codes.length)return NextResponse.json({success:false,error:{code:'INVALID_PERMISSION'}},{status:400});
    const r=await prisma.$transaction(async tx=>{
      const updated=await tx.role.update({where:{id},data:{description:b.description?String(b.description).trim():null,permissions:{deleteMany:{},create:ps.map(p=>({permissionId:p.id}))}}});
      await tx.auditLog.create({data:{actorId:me.id,action:'role.update',resource:'role',resourceId:id,changes:{description:b.description,permissionCodes:codes}}});
      return updated;
    });
    return NextResponse.json({success:true,data:r});
  }catch(e:any){return NextResponse.json({success:false,error:{code:'ROLE_UPDATE_FAILED'}},{status:500})}
}
export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){
  const me=await actor();
  if(!me)return NextResponse.json({success:false,error:{code:'FORBIDDEN'}},{status:403});
  const {id}=await params;
  const role=await prisma.role.findUnique({where:{id},include:{users:true}});
  if(!role)return NextResponse.json({success:false,error:{code:'NOT_FOUND'}},{status:404});
  if(role.name===UserRole.SUPER_ADMIN)return NextResponse.json({success:false,error:{code:'PROTECTED_ROLE'}},{status:422});
  if(role.users.length)return NextResponse.json({success:false,error:{code:'ROLE_IN_USE'}},{status:409});
  await prisma.$transaction(async tx=>{await tx.role.delete({where:{id}});await tx.auditLog.create({data:{actorId:me.id,action:'role.delete',resource:'role',resourceId:id,changes:{name:role.name}}})});
  return NextResponse.json({success:true});
}
