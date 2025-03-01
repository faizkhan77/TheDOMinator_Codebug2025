import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const UploadPDF = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: "application/pdf",
        onDrop: (acceptedFiles) => setSelectedFiles(acceptedFiles),
    });

    const handleUpload = async () => {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append("file", file);
        });

        setUploading(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/upload-pdf/", formData);
            alert("Upload successful!");
        } catch (error) {
            console.error("Upload failed", error);
        }
        setUploading(false);
    };

    return (
        <div>
            <div {...getRootProps()} style={{ border: "2px dashed #ccc", padding: "20px", cursor: "pointer" }}>
                <input {...getInputProps()} />
                <p>Drag & drop PDFs here, or click to select files</p>
            </div>
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
};

export default UploadPDF;
