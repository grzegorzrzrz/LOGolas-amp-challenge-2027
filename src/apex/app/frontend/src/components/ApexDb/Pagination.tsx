import React, {FC} from "react";
import clsx from "clsx";
import Select from "react-select";
import {useApexDbContext} from "@components/ApexDb/apexDbContext.tsx";
import {appTexts} from "../../texts.ts";
import {pageSizeOptions} from "@components/ApexDb/logic.ts";

export type PaginationProps = {
    className?: string
}
export const Pagination: FC<PaginationProps> = ({className}) => {
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        allEntries,
    } = useApexDbContext();
    const texts = appTexts.ApexDbTexts.pagination;

    const totalCount = allEntries.length;
    const totalPageCount = Math.ceil(totalCount / pageSize);

    function onPageSizeChange(selectItem) {
        setPageSize(selectItem.value)
    }

    function generatePageNumbers() {
        const pages = [];
        if (totalPageCount <= 6) {
            for (let i = 1; i <= totalPageCount; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage > 3) {
                pages.push(1, '...');
            } else {
                for (let i = 1; i <= 3; i++) {
                    pages.push(i);
                }
            }

            if (currentPage < totalPageCount - 2) {
                const startPage = currentPage === 4 ? 3 : Math.max(4, currentPage - 1);
                // const endPage = Math.min(totalPageCount - 1, currentPage + 1);
                const endPage = Math.min(totalPageCount - 1, currentPage + (currentPage > 3 ? 1 : 2));

                for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                }

                pages.push('...', totalPageCount);
            } else {
                for (let i = totalPageCount - 3; i <= totalPageCount; i++) {
                    pages.push(i);
                }
            }
        }
        return pages;
    }

    const itemsCountLabel = texts.itemsCountLabel.replace("%{from}", `${(currentPage - 1) * pageSize + 1}`)
                                 .replace("%{to}", `${Math.min(currentPage * pageSize, totalCount)}`)
                                 .replace("%{count}", `${totalCount}`);
    const pagesCountLabel = texts.pagesCountLabel.replace("%{count}", `${totalPageCount}`);

    const pageSwitchersColorClass = "cursor-pointer disabled:text-navyBlue-light text-navyBlue hover:text-navyBlue-light";

    return (
        <>
            <div className={clsx("flex flex-wrap justify-center lg:justify-between gap-4", className)}>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center text-sm text-gray-500">
                        <Select options={pageSizeOptions} value={{label: pageSize, value: pageSize}}
                                onChange={onPageSizeChange}
                                isSearchable={false}
                                unstyled={true}
                                className="mr-2"
                                classNames={{
                                    control: (state) =>
                                        "bg-white border border-gray-300 text-gray-900 text-center rounded focus:outline-none flex w-[60px] !min-h-[30px] -mt-[2px]",
                                    option: (state) => "p-2 bg-white hover:bg-gray-100",
                                    menu: (state) => "border"
                                }}/>
                        <span className="mr-2">{texts.itemsPerPage}</span>
                    </div>

                    {totalPageCount > 1 &&
                        <div className="flex">
                            {generatePageNumbers().map((page, index) => (
                                <button key={index}
                                        className={clsx(pageSwitchersColorClass, page === currentPage ? "bg-primary-300 text-white" :"bg-white",
                                            "mx-1 border border-primary-300 hover:bg-primary-500 hover:text-white  px-2 py-1 rounded-sm")}
                                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                        disabled={page === currentPage || page === '...'}>
                                    {page}
                                </button>
                            ))}
                        </div>
                    }

                    <span className="text-sm text-gray-500">{itemsCountLabel}</span>
                </div>

            </div>
        </>
    )
};

export default Pagination;
