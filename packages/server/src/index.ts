import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import cors from "@fastify/cors";
import fastify from "fastify";
import ical from "ical-generator";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import PdfParse from "pdf-parse";
import { z } from "zod";
import { validateEnv } from "./utils/validateEnv";

const server = fastify({ logger: true });
server.register(cors, {});

const env = validateEnv();
if (!env.success) {
  throw new Error("Missing environment variables");
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.data.R2_ACCESS_KEY_ID,
    secretAccessKey: env.data.R2_SECRET_ACCESS_KEY,
  },
});

const config = new Configuration({
  apiKey: env.data.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

const calendarEventSchema = z.object({
  start: z.string(),
  end: z.string(),
  summary: z.string(),
  description: z.string(),
  location: z.string(),
});
type CalendarEvent = z.infer<typeof calendarEventSchema>;

const eventSchema: CalendarEvent = {
  start: "string",
  end: "string",
  summary: "string",
  description: "string",
  location: "string",
};

server.post("/pdf/process", async (req, res) => {
  if (!req.body || typeof req.body !== "string") {
    return res.status(400).send({ message: "Missing body" });
  }
  const request = z
    .object({ keys: z.string().array() })
    .safeParse(JSON.parse(req.body));
  if (!request.success) {
    return res.status(400).send({ message: request.error.issues[0].message });
  }

  const calendar = ical({ name: "my first iCal" });

  const openaiResponses: CalendarEvent[][] = await Promise.all(
    request.data.keys.map(async (key) => {
      try {
        req.log.info(`Processing file from R2 with key: ${key}`);
        const obj = await s3.send(
          new GetObjectCommand({
            Bucket: env.data.R2_BUCKET_NAME,
            Key: key,
          })
        );
        if (!obj.Body) {
          return [];
        }
        const buffer = Buffer.from(
          (await obj.Body.transformToByteArray()).buffer
        );

        const pdf = await PdfParse(buffer);

        const fullText = pdf.text.replace(/\s+/g, " ");

        const textChunks: ChatCompletionRequestMessage[] = (
          fullText.match(/.{1,2500}/g) ?? []
        ).map((e) => ({ content: e, role: "user" }));

        req.log.info(`Requesting completion for key: ${key}`);

        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Tell me the due dates of assignments and exams contained within the course syllabus below in JSON format using the following schema:\n${JSON.stringify(
                eventSchema
              )} where both 'start' and 'end' are in the ISO date string format with a timezone offset of -${
                new Date().getTimezoneOffset() / 60
              }. The response should be a JSON array of schema. Events without a clear end time should have an end time equal to the start time. Wherever the year value of a date is ambiguous, use the year ${new Date().getFullYear()}. The syllabus:\n`,
            },
            ...textChunks,
          ],
        });

        if (completion.data.choices[0].message?.content) {
          const parsed = calendarEventSchema
            .array()
            .safeParse(JSON.parse(completion.data.choices[0].message?.content));
          if (parsed.success) {
            return parsed.data;
          }
        }

        return [];
      } catch (error) {
        console.error(error);
        return [];
      }
    })
  );

  req.log.info(
    `Deleting files from R2 with keys: ${JSON.stringify(request.data.keys)}`
  );

  // Delete files
  await Promise.all(
    request.data.keys.map((key) =>
      s3.send(
        new DeleteObjectCommand({
          Bucket: env.data.R2_BUCKET_NAME,
          Key: key,
        })
      )
    )
  );

  req.log.info(
    `Creating calendar with ${openaiResponses.flat().length} events`
  );

  for (const r of openaiResponses.flat()) {
    calendar.createEvent(r);
  }

  const blob = calendar.toBlob();

  return res.type(blob.type).send(Buffer.from(await blob.arrayBuffer()));
});

server.all("/", async (_req, res) => {
  return res.send({ message: "Hello World!" });
});

server.listen({ port: env.data.PORT, host: "0.0.0.0" }, () => {
  console.log(`Server listening on port ${env.data.PORT}`);
});
