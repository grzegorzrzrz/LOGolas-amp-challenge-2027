import React, {FC} from 'react';
import clsx from "clsx";
import {Link, useParams} from "react-router-dom";
import {useApexDbContext} from "@components/ApexDb/apexDbContext.tsx";
import {appTexts} from "../../texts.ts";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/20/solid";

export type SearchTableProps = {
    className?: string
}

const texts = appTexts.ApexDbTexts.table
const fields = [
    {name: "id", label: texts.IdLabel},
    {name: "sequence", label: texts.sequenceLabel},
    {name: "normalizedHydrophobicMoment", label: texts.hydrophobicMomentLabel},
    {name: "length", label: texts.LengthLabel},
]

export const ApexDbTable: FC<SearchTableProps> = ({className}) => {
    const {paginatedEntries, sortSettings, changeSortSettings} = useApexDbContext();
    const { dataset } = useParams<{ dataset?: string }>();
    const dbEntries = paginatedEntries;

    return (
        <>
            <div className={clsx("mt-8 flow-root", className)}>
                <div className="-mx-4">
                    <div className="inline-block min-w-full py-2 align-middle">
                        <table className="min-w-full border-separate border-spacing-0">
                            <thead>
                            <tr>
                                {fields.map(field =>
                                    <th
                                        scope="col"
                                        className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 first:pl-8 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        key={field.name}

                                    >
                                        <span className="group inline-flex cursor-pointer font-bold text-xs items-center"
                                              onClick={() => changeSortSettings(field.name)}>
                                        {field.label}
                                            <span
                                                className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                                            {sortSettings.name === field.name && sortSettings.isAscending &&
                                                <ChevronDownIcon className="h-5 w-5"
                                                                 aria-hidden="true"/>}
                                                {sortSettings.name === field.name && !sortSettings.isAscending &&
                                                    <ChevronUpIcon className="h-5 w-5" aria-hidden="true"/>}
                                                        </span>
                                       </span>
                                    </th>
                                )}
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                                >
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {dbEntries.map((entry, index) => (
                                <tr key={entry.id} className="even:bg-gray-50">
                                    <td
                                        className={clsx(
                                            index !== dbEntries.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 first:pl-8 text-sm font-medium text-gray-900 max-w-[20px]',
                                        )}
                                    >
                                        {entry.id}
                                    </td>
                                    <td
                                        className={clsx(
                                            index !== dbEntries.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-4 py-4 text-sm text-gray-700 overflow-ellipsis overflow-hidden',
                                        )}
                                    >
                                        {entry.sequence}
                                    </td>
                                    <td
                                        className={clsx(
                                            index !== dbEntries.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-4 py-4 text-sm text-gray-700',
                                        )}
                                    >
                                        {entry.normalizedHydrophobicMoment}
                                    </td>
                                    <td
                                        className={clsx(
                                            index !== dbEntries.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-4 py-4 text-sm text-gray-700',
                                        )}
                                    >
                                        {entry.length}
                                    </td>
                                    <td
                                        className={clsx(
                                            index !== dbEntries.length - 1 ? 'border-b border-gray-200' : '',
                                            'relative whitespace-nowrap py-4 pl-4 pr-4 text-right text-sm font-medium sm:pr-8 lg:pr-8',
                                        )}
                                    >
                                        <Link to={`/database/${dataset}/${entry.id}`}
                                              className="text-indigo-600 hover:text-indigo-900">
                                            {appTexts.commonTexts.view}<span className="sr-only">, {entry.id}</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
};
