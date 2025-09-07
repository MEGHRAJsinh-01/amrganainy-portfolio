import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// Remove the CSS imports that are causing issues
import '../pdf-viewer.css';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Google Drive direct download link (make sure it's set to anyone with the link can view)
const GOOGLE_DRIVE_PDF_URL = 'https://drive.google.com/uc?export=download&id=1uJ_qM50MxxVWkWH4DXIYsdjP1rSyxZB-';

interface CVViewerProps {
    language: string;
    translations: {
        viewCV: string;
        downloadCV: string;
    };
}

const CVViewer: React.FC<CVViewerProps> = ({ language, translations }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        setIsLoading(false);
    }

    function onDocumentLoadError(error: Error): void {
        console.error('Error loading PDF:', error);
        setError('Failed to load CV. Please try downloading it instead.');
        setIsLoading(false);
    }

    function changePage(offset: number) {
        setPageNumber(prevPageNumber => {
            const newPageNumber = prevPageNumber + offset;
            return Math.min(Math.max(1, newPageNumber), numPages || 1);
        });
    }

    function previousPage() {
        changePage(-1);
    }

    function nextPage() {
        changePage(1);
    }

    return (
        <div className="cv-viewer flex flex-col items-center w-full">
            <div className="pdf-container mb-4 w-full max-w-2xl bg-gray-800/50 rounded-lg overflow-hidden">
                {isLoading && (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center items-center h-48 text-red-400">
                        <p>{error}</p>
                    </div>
                )}

                <Document
                    file={GOOGLE_DRIVE_PDF_URL}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="flex justify-center items-center h-96">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    }
                    className="pdf-document"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={1.2}
                        className="pdf-page"
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        loading={
                            <div className="flex justify-center items-center h-96">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        }
                    />
                </Document>
            </div>

            {!isLoading && !error && numPages && (
                <div className="pdf-controls flex justify-between items-center w-full max-w-2xl mb-4">
                    <button
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                        className={`px-4 py-2 rounded-md ${pageNumber <= 1
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            } transition-colors duration-200`}
                    >
                        Previous
                    </button>

                    <p className="text-gray-300">
                        Page {pageNumber} of {numPages}
                    </p>

                    <button
                        onClick={nextPage}
                        disabled={pageNumber >= numPages}
                        className={`px-4 py-2 rounded-md ${pageNumber >= numPages
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            } transition-colors duration-200`}
                    >
                        Next
                    </button>
                </div>
            )}

            <div className="flex space-x-4 mt-4">
                <a
                    href={GOOGLE_DRIVE_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                >
                    <span className="material-symbols-outlined mr-2">visibility</span>
                    {translations.viewCV}
                </a>

                <a
                    href={GOOGLE_DRIVE_PDF_URL}
                    download="Amr_Elganainy_CV.pdf"
                    className="inline-flex items-center px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                >
                    <span className="material-symbols-outlined mr-2">download</span>
                    {translations.downloadCV}
                </a>
            </div>
        </div>
    );
};

export default CVViewer;
