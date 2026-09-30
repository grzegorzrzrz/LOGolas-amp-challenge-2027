import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { ApexDbTable } from "@components/ApexDb/ApexDbTable.tsx";
import { ApexDbFilters } from "@components/ApexDb/ApexDbFilters.tsx";
import { ApexDbContextProvider } from "@components/ApexDb/apexDbContext.tsx";
import Pagination from "@components/ApexDb/Pagination.tsx";
import { ApexDbHeader } from "@components/ApexDb/ApexDbHeader.tsx";
import { useDataset } from '@hooks/useDataset';
import { appTexts } from '../../texts';

export type SearchTableProps = {}

export const ApexDbPage: FC<SearchTableProps> = ({ }) => {
    const { dataset } = useParams<{ dataset?: string }>();
    const { data: db, isLoading, error } = useDataset(dataset);

    if (isLoading) return <div>{appTexts.commonTexts.loadingDataset}</div>;
    if (error) return <div>{appTexts.commonTexts.errorLoadingDataset} {error.message}</div>;
    if (!db) return null;

    return (
        <ApexDbContextProvider initialDb={db}>
            <div className="flex min-w-[1000px] border-t-2 border-top-gray-300">
                <div className="w-[300px] px-4 py-10 border-r-gray-300 border-r-2">
                    <ApexDbFilters />
                </div>

                <div className="px-4 py-10 grow">
                    <ApexDbHeader />
                    <Pagination className="z-20 relative" />
                    <ApexDbTable className="mb-8" />
                    <Pagination />
                </div>
            </div>
        </ApexDbContextProvider>
    )
};
