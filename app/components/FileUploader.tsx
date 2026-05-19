<<<<<<< Updated upstream
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";
=======
import {useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { formatSize, cn } from '../lib/utils'
>>>>>>> Stashed changes

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

<<<<<<< Updated upstream
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
=======
const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxFileSize,
    })

    const file = acceptedFiles[0] || null;

    return (
        <div className={cn(
            "w-full group cursor-pointer transition-all duration-300",
            file ? "" : "hover:scale-[1.01]"
        )}>
            <div {...getRootProps()} className={cn(
                "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-500",
                isDragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white/50 hover:border-indigo-300 hover:bg-white"
            )}>
                <input {...getInputProps()} />

                <div className="p-8 md:p-12 flex flex-col items-center text-center gap-4">
                    {file ? (
                        <div className="w-full flex items-center justify-between gap-4 animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
                            <div className="size-14 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                <img src="/images/pdf.png" alt="pdf" className="size-8" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-base font-bold text-slate-900 truncate">
                                    {file.name}
                                </p>
                                <p className="text-sm font-medium text-slate-500">
                                    {formatSize(file.size)} • Ready to analyze
                                </p>
                            </div>
                            <button 
                                className="size-10 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors group/btn" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileSelect?.(null);
                                }}
                            >
                                <img src="/icons/cross.svg" alt="remove" className="size-4 group-hover/btn:rotate-90 transition-transform" />
                            </button>
                        </div>
                    ): (
                        <>
                            <div className={cn(
                                "size-20 rounded-2xl bg-slate-50 flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-50 group-hover:rotate-6",
                                isDragActive && "bg-indigo-100 rotate-12"
                            )}>
                                <img src="/icons/info.svg" alt="upload" className="size-10 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-lg font-bold text-slate-900">
                                    <span className="text-indigo-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-sm font-medium text-slate-400">PDF files up to {formatSize(maxFileSize)}</p>
                            </div>
                            
                            {/* Decorative corner accents */}
                            <div className="absolute top-4 left-4 size-4 border-t-2 border-l-2 border-slate-100 rounded-tl-lg" />
                            <div className="absolute top-4 right-4 size-4 border-t-2 border-r-2 border-slate-100 rounded-tr-lg" />
                            <div className="absolute bottom-4 left-4 size-4 border-b-2 border-l-2 border-slate-100 rounded-bl-lg" />
                            <div className="absolute bottom-4 right-4 size-4 border-b-2 border-r-2 border-slate-100 rounded-br-lg" />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
export default FileUploader
>>>>>>> Stashed changes
