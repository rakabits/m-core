/**
 * Authenticated production smoke test.
 * Required locally: SMOKE_BASE_URL, SMOKE_ACCESS_TOKEN, SMOKE_STUDENT_ID.
 * Never prints tokens or response bodies.
 */
export {};
const base=process.env.SMOKE_BASE_URL||'https://m-core-red.vercel.app';
const token=process.env.SMOKE_ACCESS_TOKEN;
const student=process.env.SMOKE_STUDENT_ID;
if(!token||!student){console.error('Set SMOKE_BASE_URL, SMOKE_ACCESS_TOKEN, and SMOKE_STUDENT_ID locally.');process.exit(2)}
const headers={Authorization:`Bearer ${token}`};
const paths=['/api/v1/health','/api/v1/programs','/api/v1/students',`/api/v1/students/${encodeURIComponent(student)}/program-history`];
let failed=false;
for(const path of paths){const response=await fetch(base+path,{headers});console.log(`${response.status} ${path}`);if(!response.ok)failed=true}
if(failed){console.error('Authenticated smoke test failed.');process.exit(1)}
console.log('Authenticated read-only smoke test passed. No mutation was performed.');
