"use client";

import { DocumentIcon, PlusIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { AiOutlineLoading } from "react-icons/ai";
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
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const download = useRef<HTMLAnchorElement>(null);
  const [files, setFiles] = useState<File[]>([]);

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
      <Dropzone
        accept={{ "application/pdf": [".pdf"] }}
        disabled={loading}
        onDropAccepted={(acceptedFiles) => {
          setFiles((f) => [...f, ...acceptedFiles]);
        }}
        maxFiles={6}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <>
            <p className="text-center text-gray-400 mb-2 text-sm">
              Processing time is usually 15-30 seconds.
            </p>
            <div
              {...getRootProps()}
              className={clsx(
                "border border-gray-100 bg-white rounded-xl space-y-4 shadow-xl p-8 transition-all hover:bg-gray-50 cursor-pointer",
                isDragActive && "scale-110",
                loading && "animate-pulse"
              )}
            >
              <input {...getInputProps()} />
              {files.length === 0 && (
                <p className="text-center font-medium text-sm">
                  Drag drop some files here, or click to select files
                </p>
              )}
              <div className="space-y-4">
                <div className="grid-cols-1 gap-2 grid sm:grid-cols-4">
                  {files.map((f) => (
                    <div
                      key={f.name}
                      className="bg-gray-50 rounded-lg px-2 py-8 flex items-center justify-center flex-col gap-2 shrink-0"
                    >
                      <DocumentIcon className="w-8 h-8 text-gray-800" />
                      <p className="text-xs text-gray-800 text-center">
                        {f.name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-100 rounded p-2 flex items-center justify-center mx-auto w-max">
                  <PlusIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="bg-sky-100 text-sky-700 rounded-full px-4 py-1 font-medium hover:bg-sky-200 transition text-sm mt-4 flex items-center gap-2"
                onClick={async () => {
                  try {
                    if (files.length === 0) return;

                    setLoading(true);
                    const urls = await getUploadUrls(files.length);
                    const headers = new Headers();
                    headers.append("Content-Type", "application/pdf");
                    headers.append("Origin", window.location.origin);

                    await Promise.all(
                      urls.map((u, i) =>
                        fetch(u.uploadUrl, {
                          method: "PUT",
                          body: files[i],
                          headers,
                        })
                      )
                    );

                    setCalendarBlob(await processFiles(urls.map((u) => u.key)));

                    if (download.current) {
                      download.current.scrollIntoView({ behavior: "smooth" });
                    }
                  } catch (e) {
                    if (e instanceof Error) {
                      setError(e.message);
                    }
                  }

                  setLoading(false);
                }}
              >
                <span>Upload</span>
                {loading && (
                  <AiOutlineLoading size={18} className="animate-spin" />
                )}
              </button>
            </div>
          </>
        )}
      </Dropzone>
      {calendarLink.length !== 0 && (
        <div className="flex justify-center mt-16">
          <a
            target="_blank"
            rel="noreferrer"
            href={calendarLink}
            className="bg-green-100 text-green-700 rounded-full px-8 py-2 font-medium hover:bg-sky-200 transition text-lg"
            ref={download}
          >
            Download
          </a>
        </div>
      )}
    </>
  );
};

export default UploadForm;
