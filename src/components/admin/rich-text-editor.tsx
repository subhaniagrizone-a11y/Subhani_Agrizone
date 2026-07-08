"use client";

import { useEffect, useRef } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading3,
  Highlighter,
  ImagePlus,
  Link2,
  Columns2,
  Heading1,
  Heading2,
  GripHorizontal,
  Italic,
  List,
  ListOrdered,
  PaintBucket,
  Pilcrow,
  Redo2,
  Table,
  Underline,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
};

export function RichTextEditor({
  value,
  onChange,
  minHeight = 280,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function run(command: string, commandValue?: string) {
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function insertLink() {
    const url = window.prompt("Enter URL", "https://");
    if (!url) return;
    run("createLink", url);
  }

  function insertHorizontalLine() {
    run("insertHorizontalRule");
  }

  function insertShapeBox() {
    run(
      "insertHTML",
      `<div style="border:2px dashed #16a34a;border-radius:12px;padding:12px;margin:10px 0;min-height:56px;">Type here...</div>`,
    );
  }

  function insertImageByUrl() {
    const url = window.prompt("Paste image URL", "https://");
    if (!url) return;
    run(
      "insertHTML",
      `<figure style="margin:12px 0;"><img src="${url}" alt="Image" style="max-width:100%;border-radius:8px;" /><figcaption style="font-size:12px;color:#64748b;">Image caption</figcaption></figure>`,
    );
  }

  function uploadImage(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      run(
        "insertHTML",
        `<figure style="margin:12px 0;"><img src="${reader.result}" alt="Uploaded image" style="max-width:100%;border-radius:8px;" /><figcaption style="font-size:12px;color:#64748b;">Uploaded image</figcaption></figure>`,
      );
    };
    reader.readAsDataURL(file);
  }

  function insertTwoColumns() {
    run(
      "insertHTML",
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:8px 0;"><div style="padding:12px;border:1px solid #d1d5db;border-radius:8px;"><h4>Column 1</h4><p>Add text here...</p></div><div style="padding:12px;border:1px solid #d1d5db;border-radius:8px;"><h4>Column 2</h4><p>Add text here...</p></div></div>`,
    );
  }

  function insertTable() {
    run(
      "insertHTML",
      `<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr><th style="border:1px solid #d1d5db;padding:8px;text-align:left;">Title</th><th style="border:1px solid #d1d5db;padding:8px;text-align:left;">Value</th></tr></thead><tbody><tr><td style="border:1px solid #d1d5db;padding:8px;">Example</td><td style="border:1px solid #d1d5db;padding:8px;">Data</td></tr></tbody></table>`,
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-border p-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("bold")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("italic")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("underline")}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("removeFormat")}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("formatBlock", "<h1>")}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("formatBlock", "<h2>")}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("formatBlock", "<h3>")}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("formatBlock", "<p>")}
        >
          <Pilcrow className="h-4 w-4" />
        </Button>
        <label className="ml-1 inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
          Size
          <select
            className="h-6 rounded border border-input bg-background px-1"
            onChange={(event) => run("fontSize", event.target.value)}
            defaultValue="3"
          >
            <option value="1">10</option>
            <option value="2">12</option>
            <option value="3">14</option>
            <option value="4">18</option>
            <option value="5">24</option>
            <option value="6">32</option>
            <option value="7">40</option>
          </select>
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("justifyLeft")}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("justifyCenter")}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("justifyRight")}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("justifyFull")}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={insertTable}>
          <Table className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={insertTwoColumns}
        >
          <Columns2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={insertHorizontalLine}
        >
          <GripHorizontal className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={insertShapeBox}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={insertLink}>
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={insertImageByUrl}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
          Upload image
          <input
            type="file"
            accept="image/*"
            className="w-[130px] text-xs"
            onChange={(event) => uploadImage(event.target.files?.[0] ?? null)}
          />
        </label>
        <label className="ml-1 inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
          <PaintBucket className="h-4 w-4" />
          <input
            type="color"
            className="h-6 w-8 border-none bg-transparent p-0"
            onChange={(event) => run("foreColor", event.target.value)}
            aria-label="Text color"
          />
        </label>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
          BG
          <input
            type="color"
            className="h-6 w-8 border-none bg-transparent p-0"
            onChange={(event) => run("backColor", event.target.value)}
            aria-label="Background color"
          />
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("undo")}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => run("redo")}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        className="prose prose-sm max-w-none overflow-x-auto px-4 py-3 outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
