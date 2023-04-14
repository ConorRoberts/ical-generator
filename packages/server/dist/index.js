"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_1 = __importDefault(require("fastify"));
const ical_generator_1 = __importDefault(require("ical-generator"));
const openai_1 = require("openai");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const zod_1 = require("zod");
const validateEnv_1 = require("./utils/validateEnv");
const server = (0, fastify_1.default)({ logger: true });
server.register(cors_1.default, {});
const env = (0, validateEnv_1.validateEnv)();
if (!env.success) {
    throw new Error("Missing environment variables");
}
const s3 = new client_s3_1.S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: env.data.R2_ACCESS_KEY_ID,
        secretAccessKey: env.data.R2_SECRET_ACCESS_KEY,
    },
});
const config = new openai_1.Configuration({
    apiKey: env.data.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(config);
const calendarEventSchema = zod_1.z.object({
    start: zod_1.z.string(),
    end: zod_1.z.string(),
    summary: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
});
const eventSchema = {
    start: "string",
    end: "string",
    summary: "string",
    description: "string",
    location: "string",
};
server.post("/pdf/process", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body || typeof req.body !== "string") {
        return res.status(400).send({ message: "Missing body" });
    }
    const request = zod_1.z
        .object({ keys: zod_1.z.string().array() })
        .safeParse(JSON.parse(req.body));
    if (!request.success) {
        return res.status(400).send({ message: request.error.issues[0].message });
    }
    const calendar = (0, ical_generator_1.default)({ name: "my first iCal" });
    const openaiResponses = yield Promise.all(request.data.keys.map((key) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const obj = yield s3.send(new client_s3_1.GetObjectCommand({
                Bucket: env.data.R2_BUCKET_NAME,
                Key: key,
            }));
            if (!obj.Body) {
                return [];
            }
            const buffer = Buffer.from((yield obj.Body.transformToByteArray()).buffer);
            const pdf = yield (0, pdf_parse_1.default)(buffer);
            const fullText = pdf.text.replace(/\s+/g, " ");
            const textChunks = ((_a = fullText.match(/.{1,2500}/g)) !== null && _a !== void 0 ? _a : []).map((e) => ({ content: e, role: "user" }));
            const completion = yield openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: `Tell me the due dates of assignments and exams contained within the course syllabus below in JSON format using the following schema:\n${JSON.stringify(eventSchema)} where both 'start' and 'end' are in the ISO date string format with a timezone offset of -${new Date().getTimezoneOffset() / 60}. The response should be a JSON array of schema. Events without a clear end time should have an end time equal to the start time. Wherever the year value of a date is ambiguous, use the year ${new Date().getFullYear()}. The syllabus:\n`,
                    },
                    ...textChunks,
                ],
            });
            if ((_b = completion.data.choices[0].message) === null || _b === void 0 ? void 0 : _b.content) {
                const parsed = calendarEventSchema
                    .array()
                    .safeParse(JSON.parse((_c = completion.data.choices[0].message) === null || _c === void 0 ? void 0 : _c.content));
                if (parsed.success) {
                    return parsed.data;
                }
            }
            return [];
        }
        catch (error) {
            console.error(error);
            return [];
        }
    })));
    for (const r of openaiResponses.flat()) {
        calendar.createEvent(r);
    }
    const blob = calendar.toBlob();
    return res.type(blob.type).send(Buffer.from(yield blob.arrayBuffer()));
}));
server.all("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({ message: "Hello World!" });
}));
server.all("/health", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({ message: "Hello World!" });
}));
server.listen({ port: env.data.PORT }, () => {
    console.log(`Server listening on port ${env.data.PORT}`);
});
