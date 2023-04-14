import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ulid } from "ulid";
import { z } from "zod";
import { validateEnv } from "~/utils/validateEnv";

export async function GET(request: Request) {
  const env = validateEnv();

  if (!env.success) {
    return new Response(
      JSON.stringify({ message: "Missing environment variables" }),
      { status: 400 }
    );
  }
  const url = new URL(request.url);

  const body = z
    .object({
      urlCount: z.coerce
        .number({
          required_error: "Missing parameter 'urlCount'",
          invalid_type_error:
            "Parameter 'urlCount' must be a number greater than 0 and less than or equal to 10",
        })
        .min(0)
        .max(10),
    })
    .safeParse({ urlCount: url.searchParams.get("urlCount") });

  if (!body.success) {
    return new Response(
      JSON.stringify({ message: body.error.issues[0].message }),
      {
        status: 400,
      }
    );
  }

  const s3 = new S3Client({
    region: "us-east-1",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.data.R2_ACCESS_KEY_ID,
      secretAccessKey: env.data.R2_SECRET_ACCESS_KEY,
    },
  });

  const urls = await Promise.all(
    [...Array(body.data.urlCount)].map(async () => {
      const key = ulid();
      const urlPromise = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: env.data.R2_BUCKET_NAME,
          Key: key,
        }),
        { expiresIn: 3600 }
      );

      return {
        key,
        uploadUrl: urlPromise,
        downloadUrl: `https://${env.data.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.data.R2_BUCKET_NAME}/${key}`,
      };
    })
  );

  return new Response(JSON.stringify({ urls }));
}
