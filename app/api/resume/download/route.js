import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLatestCv } from "../../../../lib/portfolio";

export async function GET() {
  const cv = await getLatestCv({ noCache: true });
  const filename = `${cv.title || "Nihal_T_Resume"}.pdf`.replace(
    /[^a-zA-Z0-9._-]/g,
    "_",
  );

  let bytes;

  if (cv.fileUrl.startsWith("/")) {
    const filePath = path.join(process.cwd(), "public", cv.fileUrl);
    bytes = await readFile(filePath);
  } else {
    const response = await fetch(cv.fileUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Resume file could not be downloaded." },
        { status: 502 },
      );
    }
    bytes = Buffer.from(await response.arrayBuffer());
  }

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
