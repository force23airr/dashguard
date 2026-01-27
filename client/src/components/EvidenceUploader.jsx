import React, { useState, useRef } from 'react';
import './EvidenceUploader.css';

const EvidenceUploader = ({ files, onFilesChange, maxFiles = 5 }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);

    // Validate file types
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/jpg'];
    const validFiles = newFiles.filter(file => {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type`);
        return false;
      }
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        alert(`${file.name} is too large. Maximum file size is 500MB`);
        return false;
      }
      return true;
    });

    // Check max files limit
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add preview URLs
    const filesWithPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    onFilesChange([...files, ...filesWithPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isVideo = (type) => type.startsWith('video/');

  return (
    <div className="evidence-uploader">
      {/* Drop Zone */}
      <div
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📁</div>
        <p className="upload-text">
          <strong>Click to upload</strong> or drag and drop
        </p>
        <p className="upload-hint">
          Video or images (max {maxFiles} files, 500MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Evidence ({files.length}/{maxFiles})</h4>
          <div className="files-grid">
            {files.map((fileObj, index) => (
              <div key={index} className="file-preview">
                <div className="file-preview-media">
                  {isVideo(fileObj.type) ? (
                    <video
                      src={fileObj.preview}
                      className="preview-video"
                      controls
                    />
                  ) : (
                    <img
                      src={fileObj.preview}
                      alt={fileObj.name}
                      className="preview-image"
                    />
                  )}
                </div>
                <div className="file-info">
                  <div className="file-name" title={fileObj.name}>
                    {fileObj.name}
                  </div>
                  <div className="file-size">
                    {formatFileSize(fileObj.size)}
                  </div>
                </div>
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={() => removeFile(index)}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceUploader;
