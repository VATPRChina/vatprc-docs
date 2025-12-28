import { DocumentEntry } from "@/lib/doc";
import { Link } from "@tanstack/react-router";
import React from "react";

const DocCard = ({ title, fileName, webPath, children }: DocumentEntry) => {
  if (children && children.length > 0) {
    return (
      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-2xl">{title}</h1>
        <div className="flex flex-row flex-wrap gap-8">
          <DocList documents={children} />
        </div>
      </div>
    );
  }
  return (
    <Link to={webPath}>
      <div className="hover:bg-secondary flex w-96 flex-col gap-2 border p-2">
        <span>{title}</span>
        <span className="text-slate-500">{fileName}</span>
      </div>
    </Link>
  );
};

export const DocList: React.FC<{
  documents: DocumentEntry[];
}> = ({ documents }) => {
  return (
    <>
      {documents.map((doc) => (
        <DocCard {...doc} key={doc.path} />
      ))}
    </>
  );
};
