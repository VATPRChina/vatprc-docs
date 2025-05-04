import { Link } from "@/i18n/routing";
import { DocumentEntry } from "@/lib/docs";
import React from "react";

const DocumentCard = ({
  title,
  fileName,
  webPath,
  children,
}: DocumentEntry) => {
  if (children && children.length > 0) {
    return (
      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-2xl">{title}</h1>
        <div className="flex flex-row flex-wrap gap-8">
          <DocumentList documents={children} />
        </div>
      </div>
    );
  }
  return (
    <Link href={webPath}>
      <div className="flex w-96 flex-col gap-2 rounded-md border bg-white p-2 hover:bg-gray-50">
        <span>{title}</span>
        <span className="text-slate-500">{fileName}</span>
      </div>
    </Link>
  );
};

export const DocumentList: React.FC<{
  documents: DocumentEntry[];
}> = ({ documents }) => {
  return (
    <>
      {documents.map((doc) => (
        <DocumentCard {...doc} key={doc.path} />
      ))}
    </>
  );
};
