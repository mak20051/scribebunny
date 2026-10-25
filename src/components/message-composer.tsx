"use client";

import { upload } from "@vercel/blob/client";
import { CircleCheck, Paperclip, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { postMessageAction } from "@/app/portal/actions";
import {
  ALLOWED_TYPES,
  DEMO_MAX_FILE_BYTES,
  DEMO_TYPES,
  formatBytes,
  MAX_FILE_BYTES,
  MAX_FILES_PER_MESSAGE,
  uploadPathname,
} from "@/lib/attachments";

type Props = {
  orderRef: string;
  k: string;
  demo: boolean;
  /** True when the Blob store is set up: files go straight to it. */
  directUpload: boolean;
  placeholder: string;
  note: string;
};

/** The message box: text plus screenshots and files (attach, paste or drop). */
export function MessageComposer({
  orderRef,
  k,
  demo,
  directUpload,
  placeholder,
  note,
}: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const picker = useRef<HTMLInputElement>(null);
  const types = demo ? DEMO_TYPES : ALLOWED_TYPES;
  const maxBytes = demo ? DEMO_MAX_FILE_BYTES : MAX_FILE_BYTES;

  function addFiles(list: FileList | File[]) {
    const accepted: File[] = [];
    const problems: string[] = [];
    for (const file of Array.from(list)) {
      if (!types.includes(file.type)) {
        problems.push(
          `${file.name}: we can't take this type of file. Send a link to it instead.`,
        );
      } else if (file.size > maxBytes) {
        problems.push(
          `${file.name} is over ${formatBytes(maxBytes)}. Send a link to it instead.`,
        );
      } else {
        // Pasted screenshots all arrive as "image.png".
        accepted.push(
          file.name === "image.png"
            ? new File([file], `screenshot-${Date.now()}.png`, {
                type: file.type,
              })
            : file,
        );
      }
    }
    setError(problems.join(" ") || null);
    setFiles((current) =>
      [...current, ...accepted].slice(0, MAX_FILES_PER_MESSAGE),
    );
  }

  async function uploadFile(file: File, label: string) {
    if (directUpload) {
      const blob = await upload(uploadPathname(orderRef, file.name), file, {
        access: "private",
        contentType: file.type,
        handleUploadUrl: "/api/portal/upload",
        clientPayload: JSON.stringify({ ref: orderRef, k }),
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: ({ percentage }) =>
          setStatus(`${label} ${Math.round(percentage)}%`),
      });
      return blob.pathname;
    }
    const form = new FormData();
    form.set("ref", orderRef);
    form.set("k", k);
    form.set("file", file);
    const response = await fetch("/api/portal/upload", {
      method: "POST",
      body: form,
    });
    const data = (await response.json()) as {
      pathname?: string;
      error?: string;
    };
    if (!response.ok || !data.pathname) {
      throw new Error(data.error ?? "Upload failed.");
    }
    return data.pathname;
  }

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim() && !files.length) return;
    setError(null);
    startTransition(async () => {
      try {
        const attachments = [];
        for (const [index, file] of files.entries()) {
          const label =
            files.length > 1
              ? `Uploading ${index + 1} of ${files.length}…`
              : "Uploading…";
          setStatus(label);
          attachments.push({
            pathname: await uploadFile(file, label),
            name: file.name,
          });
        }
        setStatus("Sending…");
        const form = new FormData();
        form.set("ref", orderRef);
        form.set("k", k);
        form.set("message", text);
        form.set("attachments", JSON.stringify(attachments));
        await postMessageAction(form);
        setText("");
        setFiles([]);
      } catch (problem) {
        setError(
          problem instanceof Error && problem.message.length < 200
            ? problem.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setStatus(null);
      }
    });
  }

  return (
    <form
      onSubmit={send}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        if (!event.dataTransfer.files.length) return;
        event.preventDefault();
        addFiles(event.dataTransfer.files);
      }}
      className="mt-6 space-y-3 border-t-2 border-dashed border-gray-200 pt-6"
    >
      <label htmlFor="message" className="sr-only">
        Your message
      </label>
      <textarea
        id="message"
        name="message"
        rows={4}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onPaste={(event) => {
          const pasted = Array.from(event.clipboardData.files);
          if (!pasted.length) return;
          event.preventDefault();
          addFiles(pasted);
        }}
        placeholder={placeholder}
        className="form-input"
      />
      {files.length ? (
        <ul className="flex flex-wrap gap-2" aria-label="Files to send">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-full border-2 border-gray-800 bg-[#FFF9E0] py-1 pr-1 pl-3 text-sm font-semibold text-gray-800"
            >
              <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 font-normal text-gray-600">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  setFiles((current) => current.filter((_, i) => i !== index))
                }
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded-full p-1 hover:bg-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p role="alert" className="text-base font-semibold text-[#C81E1E]">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => picker.current?.click()}
          className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Paperclip className="h-5 w-5" aria-hidden="true" />
          Attach files
        </button>
        <input
          ref={picker}
          type="file"
          multiple
          accept={types.join(",")}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="submit"
          disabled={pending || (!text.trim() && !files.length)}
          className="btn-primary w-full disabled:opacity-60 sm:w-auto"
        >
          {pending ? (status ?? "Sending…") : "Send message"}
        </button>
      </div>
      <p className="flex items-start gap-2 text-base text-gray-600">
        <CircleCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-[#FF3333]"
          aria-hidden="true"
        />
        {note}
      </p>
      <p className="text-sm text-gray-500">
        Paste a screenshot, drop files here, or use Attach files: up to{" "}
        {MAX_FILES_PER_MESSAGE} files, {formatBytes(maxBytes)} each
        {demo ? " (images and PDFs in the demo)" : ""}.
      </p>
    </form>
  );
}
