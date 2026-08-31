import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const auth={getUser:vi.fn()}; const permission=vi.fn(); const list=vi.fn(); const create=vi.fn();
vi.mock('@/lib/supabase/server',()=>({createSupabaseServerClient:vi.fn(async()=>({auth}))}));
vi.mock('@/modules/rbac/authorization',()=>({hasPermission:permission,getScopes:vi.fn(async()=>[])}));
vi.mock('@/modules/students/service',()=>({listStudents:list,createStudent:create}));
vi.mock('@/modules/students/validation',async()=>{const { z }=await import('zod'); return {studentCreateSchema:{safeParse:vi.fn((v)=>v.fullName?{success:true,data:v}:{success:false,error:new z.ZodError([{code:'custom',path:['fullName'],message:'Required'}])})}}});
const { GET, POST }=await import('@/app/api/v1/students/route');
function request(url='http://localhost/api/v1/students',init?:{method?:string;body?:string;headers?:Record<string,string>}){return new NextRequest(url,init)}
describe('Student API authorization',()=>{beforeEach(()=>{vi.clearAllMocks();auth.getUser.mockResolvedValue({data:{user:null}});permission.mockResolvedValue(false)});it('returns 401 for anonymous GET',async()=>expect((await GET(request())).status).toBe(401));it('returns 401 for anonymous POST',async()=>expect((await POST(request(undefined,{method:'POST',body:'{}',headers:{'content-type':'application/json'}}))).status).toBe(401));it('returns 403 when GET permission is missing',async()=>{auth.getUser.mockResolvedValue({data:{user:{id:'u1'}}});expect((await GET(request())).status).toBe(403)});it('returns 403 when create permission is missing',async()=>{auth.getUser.mockResolvedValue({data:{user:{id:'u1'}}});expect((await POST(request(undefined,{method:'POST',body:'{}',headers:{'content-type':'application/json'}}))).status).toBe(403)});it('returns 422 for invalid create payload',async()=>{auth.getUser.mockResolvedValue({data:{user:{id:'u1'}}});permission.mockResolvedValue(true);expect((await POST(request(undefined,{method:'POST',body:'{}',headers:{'content-type':'application/json'}}))).status).toBe(422)});});

