import React, {FC} from 'react';
import {useParams, Link} from "react-router-dom";
import {ApexDbContextProvider} from "@components/ApexDb/apexDbContext.tsx";
import {DbEntry} from "@logic/models.ts";
import {appTexts} from "../../texts";
import {useDataset} from '@hooks/useDataset';

export type PeptideDetailsProps = {}

export const PeptideDetails: FC<PeptideDetailsProps> = ({}) => {
    const { id, dataset = 'apexdb' } = useParams<{ id?: string; dataset?: string }>();
    const { data: db, isLoading, error } = useDataset(dataset);

    if (!id) throw new Error("no id provided");
    if (isLoading) return <div>{appTexts.commonTexts.loadingDataset}</div>;
    if (error) return <div>{appTexts.commonTexts.errorLoadingDataset} {error.message}</div>;
    if (!db) return null;

    const peptide = db.entries.find((entry: DbEntry) => entry.id === +id);
    if (!peptide) return <></>;

    const peptideFields = Object.values(peptide) ?? [];

    return (
        <ApexDbContextProvider initialDb={db}>
            <div className="section-wrapper">
                <Link 
                    to={`/database/${dataset}`}
                    className="inline-flex items-center mb-5 text-indigo-600 hover:text-indigo-900"
                >
                    ← {appTexts.peptideDetailsTexts.goBack}
                </Link>
                <p className="my-5">{appTexts.peptideDetailsTexts.detailsIntro}</p>
                <div>
                    {peptideFields.map((entry: string, index: number) =>
                        <div className="flex w-full justify-between border-b border-gray-300 even:bg-gray-50 px-2" key={index}>
                            <span className="basis-1/2 p-2">{db.headers[index]}</span>
                            <span className="p-2">{entry}</span>
                        </div>
                    )}
                </div>
            </div>
        </ApexDbContextProvider>
    )
};
