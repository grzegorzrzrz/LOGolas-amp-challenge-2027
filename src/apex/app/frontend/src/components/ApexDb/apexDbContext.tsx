import {Database, DbContextType, DbEntry, SearchFilterState, SortSettings} from "@logic/models";
import {createContext, FC, ReactNode, useContext, useEffect, useState} from "react";
import {
    filterApexDb,
    defaultFilterState,
    defaultPageSize,
    defaultSortSettings,
    sortApexDb, getNewSortSettings
} from "@components/ApexDb/logic.ts";

const DbContext = createContext<DbContextType>({
    allEntries: [],
    paginatedEntries: [],
    headers: [],
    filters: defaultFilterState,
    currentPage: 1,
    pageSize: defaultPageSize,
    sortSettings: defaultSortSettings,
    setFilters: () => {},
    setPageSize: () => {},
    setCurrentPage: () => {},
    setSortSettings: () => {},
    changeSortSettings: () => {},
})

export type DbContextProviderType = {
    children: ReactNode
    initialDb: Database | undefined
}

export const ApexDbContextProvider: FC<DbContextProviderType> = ({initialDb, children}) => {
    const [db, setDb] = useState<Database>({entries: [], headers: [], entriesArray: []});
    const [filters, setFilters] = useState<SearchFilterState>(defaultFilterState);
    const [filteredAndSortedItems, setFilteredAndSortedItems] = useState<DbEntry[]>([])

    const [paginatedItems, setPaginatedItems] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [sortSettings, setSortSettings] = useState(defaultSortSettings)

    useEffect(() => {
        setDb(initialDb)
    },[initialDb])

    useEffect(() => {
        const filteredData = filterApexDb(db.entries, filters)
        const filteredAndSortedData = sortApexDb(filteredData, sortSettings.name, sortSettings.isAscending);

        setFilteredAndSortedItems(filteredAndSortedData);
        setCurrentPage(1);

    }, [db, sortSettings, filters])

    useEffect(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        setPaginatedItems(filteredAndSortedItems.slice(firstPageIndex, lastPageIndex));
    }, [filteredAndSortedItems, currentPage, pageSize])

    const changeSortSettings = (fieldName: string) => {
        setSortSettings(getNewSortSettings(fieldName, sortSettings))
    }

    const value: DbContextType = {
        allEntries: filteredAndSortedItems,
        paginatedEntries: paginatedItems,
        headers: db.headers,
        filters,
        currentPage,
        pageSize,
        sortSettings,
        setFilters,
        setPageSize,
        setCurrentPage,
        setSortSettings,
        changeSortSettings,
    }

    return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
}

export const useApexDbContext = () => useContext(DbContext);
