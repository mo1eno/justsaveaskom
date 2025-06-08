import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { whitelist } = await req.json();

    console.log("✅ Данные получены:", whitelist);

    return NextResponse.json({ message: "Белый список сохранён успешно!" });
  } catch {
    // Убрали переменную `error`, чтобы избежать предупреждения от ESLint
    return NextResponse.json({ error: "Ошибка при сохранении" }, { status: 500 });
  }
}
