import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const UploadIcon = () => (
    <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0] || null;
            onFileSelect?.(file);
        },
        [onFileSelect]
    );

    const maxFileSize = 20 * 1024 * 1024;

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        multiple: false,
        accept: { "application/pdf": [".pdf"] },
        maxSize: maxFileSize,
    });

    const file = acceptedFiles[0] || null;

    if (file) {
        return (
            <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 min-w-0">
                    <img src="/images/pdf.png" alt="PDF" className="w-8 h-8 flex-shrink-0" />
                    <div className="min-w-0">
                        <p
                            className="font-medium text-text-primary truncate"
                            style={{ fontSize: "var(--text-small)" }}
                        >
                            {file.name}
                        </p>
                        <p
                            className="text-text-tertiary num"
                            style={{ fontSize: "var(--text-tiny)" }}
                        >
                            {formatSize(file.size)}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="btn-icon flex-shrink-0"
                    aria-label="Remove file"
                    onClick={() => onFileSelect?.(null)}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "dropzone-active" : ""}`}
        >
            <input {...getInputProps()} aria-label="Upload resume PDF" />
            <div className="text-brand-600">
                <UploadIcon />
            </div>
            <div>
                <p
                    className="font-medium text-text-primary"
                    style={{ fontSize: "var(--text-sub)" }}
                >
                    {isDragActive ? "Drop your PDF here" : "Drop your PDF here, or click to browse"}
                </p>
                <p className="helper-text">PDF only, up to {formatSize(maxFileSize)}</p>
            </div>
        </div>
    );
};

export default FileUploader;
