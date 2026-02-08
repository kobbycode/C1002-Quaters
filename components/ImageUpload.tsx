
import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../utils/firebase';

interface ImageUploadProps {
    currentImage?: string;
    onImageUploaded: (url: string) => void;
    onError?: (error: string) => void;
    folder?: string;
    label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageUploaded, onError, folder = 'uploads', label = 'Upload Image' }) => {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create a preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setUploading(true);
        setProgress(0);


        // Create a reference to the file in Firebase Storage
        try {
            if (!auth.currentUser) {
                console.error("User not authenticated before upload!");
                if (onError) onError("Authentication error. Please login again.");
                else alert("You must be logged in to upload.");
                setUploading(false);
                return;
            }
            console.log("Starting upload as:", auth.currentUser.email);
            const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setUploading(false);
                    if (onError) onError("Failed to upload image. Please try again.");
                    else alert("Failed to upload image.");
                },
                async () => {
                    // Upload completed successfully, get the download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onImageUploaded(downloadURL);
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error("Error initiating upload:", error);
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">
                {label}
            </label>

            <div
                className={`relative w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-all group ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-gold hover:bg-gold/5'}`}
                onClick={() => fileInputRef.current?.click()}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-6">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block">Click to Upload</span>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                        <div className="w-1/2 h-1 bg-white/20 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gold transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">{Math.round(progress)}%</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};

export default ImageUpload;
