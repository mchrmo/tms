import fileService from "@/lib/services/file.service";
import { errorHandler } from "@/lib/services/api.service";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";
import JSZip from "jszip";

export const POST = errorHandler(async (req: Request) => {
  const body = await req.json();
  const files: { path: string; name: string }[] = body.files;

  if (!Array.isArray(files) || files.length === 0) {
    throw new ApiError(400, "No files provided");
  }

  const zip = new JSZip();

  await Promise.all(
    files.map(async ({ path, name }) => {
      const { buffer } = await fileService.getFile(path);
      zip.file(name, buffer);
    })
  );

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="prilohy.zip"`,
    },
  });
});
