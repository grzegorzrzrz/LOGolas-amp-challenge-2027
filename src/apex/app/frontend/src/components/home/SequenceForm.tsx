import { FC, useState } from 'react';
import { FastaDropzone } from './Dropzone';
import { Loader2 } from 'lucide-react';
import { InfoIcon } from '@components/dumb-components/InfoIcon';
import {appTexts} from "../../texts";

type InputType = 'text' | 'file' | null;

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || '';
console.log(BACKEND_BASE_URL)

export const SequenceForm: FC = () => {
    const texts = appTexts.sequenceFormTexts;
    const [inputType, setInputType] = useState<InputType>(null);
    const [email, setEmail] = useState('');
    const [textContent, setTextContent] = useState('');
    const [fileContent, setFileContent] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [fileSizeError, setFileSizeError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!email) return;
        if (!textContent && !fileContent) return;
        
        setIsLoading(true);
        setStatus('idle');
        try {
            const endpoint = inputType === 'file' 
                ? `${BACKEND_BASE_URL}/api/sequence/submit-file`
                : `${BACKEND_BASE_URL}/api/sequence/submit-text`;

            const formData = new FormData();
            formData.append('email', email);
            
            if (inputType === 'file' && fileContent) {
                formData.append('file', fileContent);
            } else {
                formData.append('text', textContent);
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Request failed');

            setStatus('success');
            setTextContent('');
            setFileContent(null);
            setEmail('');
            setInputType(null);
        } catch (error) {
            console.error('Submission failed:', error);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFileContent(null);
        setTextContent('');
        setInputType('text');
        setStatus('idle');
        setFileSizeError(null);
    };

    if (isLoading) {
        return (
            <section className="h-[90vh] flex flex-col items-center justify-center px-4 mt-[-100px]">
                <div className="flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin h-8 w-8 mb-4" />
                    <p>{texts.submitting}</p>
                </div>
            </section>
        );
    }

    const showFileUpload = inputType === 'file' && !fileContent;
    const showTextArea = inputType !== 'file';
    const hasContent = textContent || fileContent;

    return (
        <section className="h-[90vh] flex flex-col items-center justify-center px-4 mt-[-100px]">
            <div className="flex items-center justify-center mb-8 gap-2">
                <h1 className="text-3xl text-gray-800">{texts.title}</h1>
                <InfoIcon tooltip={texts.titleTooltip} />
            </div>

            <div className="w-full max-w-2xl space-y-4">
                <div className="flex items-center gap-2">
                    <input
                        type="email"
                        placeholder={texts.emailPlaceholder}
                        className="w-full p-3 border border-primary-300 rounded-xl resize-none focus:outline-none focus:ring-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <InfoIcon tooltip={texts.emailTooltip} />
                </div>

                {showTextArea && (
                    <div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <textarea
                                    className="w-full h-24 p-3 border border-primary-300 rounded-xl resize-none focus:outline-none focus:ring-2"
                                    placeholder={texts.sequencePlaceholder}
                                    value={textContent}
                                    maxLength={20000}
                                    onChange={(e) => {
                                        const value = e.target.value.slice(0, 20000);
                                        setTextContent(value);
                                        setInputType('text');
                                        setStatus('idle');
                                    }}
                                />
                                <p className="text-xs text-gray-400 text-right mt-1">
                                    {textContent.length}{texts.characterCount}
                                </p>
                            </div>
                            <div className="flex items-center h-24">
                                <InfoIcon tooltip={texts.sequenceTooltip} />
                            </div>
                        </div>
                    </div>
                )}

                {showFileUpload && (
                    <FastaDropzone 
                        onFileSelect={(file) => {
                            setFileContent(file);
                            setStatus('idle');
                            setFileSizeError(null);
                        }}
                        onFileRejected={(error) => {
                            setFileSizeError(error);
                        }}
                        className="border-2 border-dashed rounded-xl p-8 border-primary-300"
                    />
                )}

                {fileContent && (
                    <p className="text-sm text-center text-gray-600">
                        {texts.selectedFile}{fileContent.name}
                    </p>
                )}
                
                {fileSizeError && <p className="text-red-500 text-sm mb-4 text-center">{fileSizeError}</p>}
                {status === 'error' && <p className="text-red-500 text-sm mb-4 text-center">{texts.submitError}</p>}
                {status === 'success' && <p className="text-green-500 text-sm mb-4 text-center">{texts.submitSuccess}</p>}
                
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!email || (!textContent && !fileContent)}
                        className="bg-primary-500 text-white rounded-md px-8 py-3 font-semibold text-base hover:bg-opacity-90 disabled:bg-opacity-50"
                    >
                        {texts.submitButton}
                    </button>
                </div>

                <div className="text-center">
                    <p className="mb-2">{texts.orDivider}</p>
                    {inputType === 'file' ? (
                        <button
                            onClick={handleReset}
                            className="bg-primary-500 text-white rounded-md px-8 py-3 font-semibold text-base hover:bg-opacity-90"
                        >
                            {texts.enterManuallyButton}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setInputType('file');
                                setStatus('idle');
                                setFileSizeError(null);
                            }}
                            className="bg-primary-500 text-white rounded-md px-8 py-3 font-semibold text-base hover:bg-opacity-90"
                        >
                            {texts.uploadFileButton}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}; 