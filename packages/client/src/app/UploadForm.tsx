"use client";

import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { z } from "zod";

const getUploadUrls = async (count: number) => {
  const url = new URL(window.location.origin + "/api/get-upload-urls");
  url.searchParams.set("urlCount", count.toString());

  const res = await fetch(url.toString(), { method: "GET" });
  const urls = z
    .object({
      urls: z
        .object({
          key: z.string().ulid(),
          downloadUrl: z.string().url(),
          uploadUrl: z.string().url(),
        })
        .array()
        .catch(() => []),
    })
    .parse(await res.json());

  return urls.urls;
};

const processFiles = async (keys: string[]) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pdf/process`, {
    method: "POST",
    body: JSON.stringify({ keys }),
  });

  return await res.blob();
};

const UploadForm = () => {
  const [calendarLink, setCalendarLink] = useState("");
  const [calendarBlob, setCalendarBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (calendarBlob) {
      const url = URL.createObjectURL(calendarBlob);
      setCalendarLink(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [calendarBlob]);

  return (
    <>
      <Dropzone>
        {({ getRootProps, getInputProps, acceptedFiles }) => (
          <>
            <div
              {...getRootProps()}
              className="border rounded-xl bg-gray-100 p-8"
            >
              <input {...getInputProps()} />
              <p>Drag drop some files here, or click to select files</p>
            </div>
            <div className="flex gap-2 items-center">
              {acceptedFiles.map((f) => (
                <div key={f.name} className="border rounded p-2 font-medium">
                  {f.name}
                </div>
              ))}
            </div>
            <button
              className="bg-sky-100 text-sky-700 rounded-full px-4 py-1 font-medium hover:bg-sky-200 transition text-sm"
              onClick={async () => {
                const urls = await getUploadUrls(acceptedFiles.length);
                const headers = new Headers();
                headers.append("Content-Type", "multipart/form-data");
                headers.append("Origin", window.location.origin);

                await Promise.all(
                  urls.map((u, i) =>
                    fetch(u.uploadUrl, {
                      method: "PUT",
                      body: acceptedFiles[i],
                      headers,
                    })
                  )
                );

                setCalendarBlob(await processFiles(urls.map((u) => u.key)));
              }}
            >
              Submit
            </button>
          </>
        )}
      </Dropzone>
      {calendarLink.length > 0 && (
        <a
          target="_blank"
          rel="noreferrer"
          href={calendarLink}
          className="bg-green-100 text-green-700 rounded-full px-4 py-1 font-medium hover:bg-sky-200 transition text-sm"
        >
          Download
        </a>
      )}
    </>
  );
};

export default UploadForm;
