
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileVideo, FileImage, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadFile } from '@/hooks/use-data';

interface FileUploadProps {
  bucket?: 'uploads' | 'pr-videos' | 'user-avatars' | 'team-media';
  usageType?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete?: (file: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('image/')) return FileImage;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({
  bucket = 'uploads',
  usageType = 'general',
  relatedEntityType,
  relatedEntityId,
  accept,
  maxSizeMB = 50,
  onUploadComplete,
  onUploadError,
  className = '',
  multiple = false,
  disabled = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadFile, loading: uploading, error: uploadError } = useUploadFile();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    if (accept) {
      const allowedTypes = accept.split(',').map(type => type.trim());
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isValidType) {
        return `File type not allowed. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
      return;
    }

    if (!multiple && validFiles.length > 1) {
      onUploadError?.('Only one file allowed');
      return;
    }

    setSelectedFiles(validFiles);
  }, [accept, maxSizeMB, multiple, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const { files } = e.dataTransfer;
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.target.files);
  }, [disabled, handleFiles]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);
        formData.append('usage_type', usageType);
        if (relatedEntityType) formData.append('related_entity_type', relatedEntityType);
        if (relatedEntityId) formData.append('related_entity_id', relatedEntityId);

        const result = await uploadFile(formData);
        onUploadComplete?.(result?.file);
      }

      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          relative cyber-border p-8 text-center cursor-pointer transition-all duration-300
          ${dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-cyan-500/40 hover:border-cyan-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />

        <Upload className="mx-auto h-12 w-12 text-cyan-400 mb-4" />

        <h3 className="font-orbitron text-lg font-semibold neon-text mb-2">
          {dragActive ? 'Drop files here' : 'Upload Files'}
        </h3>

        <p className="text-muted-foreground font-rajdhani">
          Drag and drop files here, or click to browse
        </p>

        <p className="text-sm text-muted-foreground mt-2">
          Max size: {maxSizeMB}MB {accept && `• Accepted: ${accept}`}
        </p>
      </motion.div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-rajdhani font-semibold text-foreground">
            Selected Files ({selectedFiles.length})
          </h4>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 cyber-card"
                >
                  <FileIcon className="h-5 w-5 text-cyan-400" />

                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="h-8 w-8 p-0"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="w-full cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      )}

      {/* Error Display */}
      {(uploadError || onUploadError) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 cyber-card border-red-500/20 bg-red-500/10"
        >
          <p className="text-red-400 font-rajdhani text-sm">
            {uploadError}
          </p>
        </motion.div>
      )}
    </div>
  );
}