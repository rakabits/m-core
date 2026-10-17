import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasPermission } from "@/modules/rbac/authorization";
import { getOrSeedClassDefinitions } from "@/modules/class-catalog/service";

async function actor() {
  const supabase = await createSupabaseServerClient();
  return (await supabase.auth.getUser()).data.user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await actor();
    if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    if (!(await hasPermission(user.id, "program.view"))) return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
    const programId = request.nextUrl.searchParams.get("programId");
    if (!programId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "programId wajib diisi." } }, { status: 422 });
    return NextResponse.json({ success: true, data: await getOrSeedClassDefinitions(programId) });
  } catch (error) {
    console.error("[GET /api/v1/class-definitions]", error);
    return NextResponse.json({ success: false, error: { code: "CLASS_CATALOG_LIST_FAILED" } }, { status: 500 });
  }
}
