import React, { useState } from 'react';
import { portfolioAPI } from '../api';

const FileUploadTest: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [uploadedUrl, setUploadedUrl] = useState<string>('');

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadStatus(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus('Please select a file first');
            return;
        }

        try {
            setUploadStatus('Uploading...');
            const result = await portfolioAPI.uploadProfileImage(selectedFile);
            setUploadedUrl(result.profileImage);
            setUploadStatus('✅ Upload successful!');
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadStatus(`❌ Upload failed: ${error.message || 'Unknown error'}`);
        }
    };

    const handleGetProfile = async () => {
        try {
            setUploadStatus('Fetching profile...');
            const profile = await portfolioAPI.getProfile();
            setUploadStatus('✅ Profile fetched successfully!');
            console.log('Profile data:', profile);
        } catch (error: any) {
            console.error('Profile fetch error:', error);
            setUploadStatus(`❌ Profile fetch failed: ${error.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">File Upload Test</h2>

            <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                    Select Image File
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-600"
                >
                    Upload Image
                </button>

                <button
                    onClick={handleGetProfile}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                    Get Profile
                </button>
            </div>

            {uploadStatus && (
                <div className="mb-4 p-3 bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-300">{uploadStatus}</p>
                </div>
            )}

            {uploadedUrl && (
                <div className="mb-4">
                    <p className="text-gray-300 text-sm mb-2">Uploaded Image:</p>
                    <img
                        src={uploadedUrl}
                        alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-md border border-gray-600"
                    />
                </div>
            )}

            <div className="text-xs text-gray-500">
                <p>✅ API endpoints updated to match backend</p>
                <p>✅ Error handling implemented</p>
                <p>✅ GridFS integration ready</p>
            </div>
        </div>
    );
};

export default FileUploadTest;