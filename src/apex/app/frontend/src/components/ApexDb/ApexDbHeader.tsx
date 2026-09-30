import React, {FC} from 'react';
import clsx from 'clsx';
import {useParams} from 'react-router-dom';
import {appTexts} from "../../texts";
import {getDatasetByName} from '@config/datasets';

export type HeaderProps = {
    className?: string
}

export const ApexDbHeader: FC<HeaderProps> = ({className}) => {
    const texts = appTexts.apexDbHeaderTexts;
    const { dataset = 'apexdb' } = useParams<{ dataset?: string }>();
    const datasetConfig = getDatasetByName(dataset);
    const csvFilePath = datasetConfig?.filePath;
    
    return (
        <div className={clsx("sm:flex sm:items-center mb-10", className)}>
            <div className="sm:flex-auto">
                <h1 className="text-base font-semibold leading-6 text-gray-900">{texts.title}</h1>
                <p className="mt-2 text-gray-800">
                    {texts.description}
                </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0">
                <a
                    href={csvFilePath}
                    download
                    className="inline-flex items-center rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-300"
                >
                    {texts.downloadButton}
                </a>
            </div>
        </div>
    )
};
