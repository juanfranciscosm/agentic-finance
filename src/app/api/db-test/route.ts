import {
  getDemoUserId,
  getSupabaseAdmin,
} from "@/lib/database/supabase-server";

export async function GET(): Promise<Response> {
  try {
    const supabase = getSupabaseAdmin();
    const demoUserId = getDemoUserId();

    const { data, error } = await supabase
      .from("app_users")
      .select("id, display_name, created_at")
      .eq("id", demoUserId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      ok: true,
      message: "Supabase conectado correctamente.",
      user: data,
    });
  } catch (error) {
    console.error("Error probando Supabase:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido.";

    return Response.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}