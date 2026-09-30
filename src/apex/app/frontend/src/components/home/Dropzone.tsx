import { FC, useState } from 'react';
import clsx from 'clsx';
import Dropzone, { FileRejection } from 'react-dropzone'
import { FileText, Loader2, MousePointerSquareDashed } from 'lucide-react'
import {appTexts} from "../../texts";

export type DropzoneProps = {
    className?: string;
    onFileSelect?: (file: File) => void;
    onFileRejected?: (error: string) => void;
}

export const FastaDropzone: FC<DropzoneProps> = ({ className, onFileSelect, onFileRejected }) => {
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const texts = appTexts.dropzoneTexts;
    
    const onDropRejected = (rejectedFiles: FileRejection[]) => {
        const [file] = rejectedFiles;
        setIsDragOver(false);
        
        if (file.errors.some(err => err.code === 'file-too-large')) {
            const errorMsg = `${texts.fileTooLargePrefix}${file.file.name}${texts.fileTooLargeSuffix}`;
            onFileRejected?.(errorMsg);
        } else {
            const errorMsg = `${file.file.name}${texts.invalidFileSuffix}`;
            console.error(errorMsg);
            onFileRejected?.(errorMsg);
        }
    }
    
    const onDropAccepted = (acceptedFiles: File[]) => {
        const [file] = acceptedFiles;
        onFileSelect?.(file);
        setIsDragOver(false);
    }

    return (
        <div className={clsx("", className)}>
            <Dropzone
                onDropRejected={onDropRejected}
                onDropAccepted={onDropAccepted}
                accept={{
                    'application/fasta': ['.fasta'],
                    'text/plain': ['.fasta']
                }}
                maxSize={50 * 1024 * 1024}
                onDragEnter={() => setIsDragOver(true)}
                onDragLeave={() => setIsDragOver(false)}>
                {({ getRootProps, getInputProps }) => (
                    <div
                        className='h-full w-full flex-1 flex flex-col items-center justify-center'
                        {...getRootProps()}>
                        <input {...getInputProps()} />
                        {isDragOver ? (
                            <MousePointerSquareDashed className='h-6 w-6 text-muted-foreground mb-2' />
                        ) : isLoading ? (
                            <Loader2 className='animate-spin h-6 w-6 text-muted-foreground mb-2' />
                        ) : (
                            <FileText className='h-6 w-6 text-muted-foreground mb-2' />
                        )}
                        <div className='flex flex-col justify-center mb-2 text-sm text-foreground'>
                            {isLoading ? (
                                <div className='flex flex-col items-center'>
                                    <p>{texts.processing}</p>
                                </div>
                            ) : isDragOver ? (
                                <p>
                                    <span className='font-semibold'>{texts.dropFile}</span> {texts.toUpload}
                                </p>
                            ) : (
                                <p>
                                    <span className='font-semibold'>{texts.clickToUpload}</span> {texts.dragAndDrop}
                                </p>
                            )}
                        </div>

                        <p className='text-xs text-muted-foreground'>{texts.fastaFilesOnly}</p>
                    </div>
                )}
            </Dropzone>
        </div>
    );
};

