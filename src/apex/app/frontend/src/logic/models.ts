// export type DbEntry = {
//     dlf: number
//     peptide: string
//     sequence: string
//     ABaumaniiATCC19606: string
//     EColiATCC11775: string
//     EColiAIC221: string
//     EColiAIC222: string
//     KPneumoniaeATCC13883: string
//     PAeruginosaPA01: string
//     PAeruginosaPA14: string
//     SAureusATCC12600: string
//     SAureusATCCBAA1556MRSA: string
//     VancomycinResistantEFaecalisATCC700802: string
//     VancomycinResistantEFaeciumATCC700221: string
//     EColiNissle: string
//     SalmonellaEntericaATCC9150BEIRES515: string
//     SalmonellaEntericaBEIRES170: string
//     SalmonellaEntericaATCC9150BEIRES174: string
//     LMonocytogenesATCC19111BEIRES106: string
//     NeisseriaMeningitisATCC13077: string
//     PorphyromorasGingivalisATCCBAA308: string
//     EColiK1ATCC700973: string
//     AMuciniphilaATCCBAA835: string
//     BEggerthiATCC27754: string
//     BFragilisATCC25285: string
//     BOvatusATCC8483: string
//     BThetaiotaomicronATCC29148: string
//     BUniformisATCC8492: string
//     BVulgatusATCC8482: string
//     CAerofaciensATCC25986: string
//     CScindensATCC35704: string
//     CSpiroformeATCC29900: string
//     CSymbiosum: string
//     ERectaleATCC33656: string
//     PCopriDSMZ18205: string
//     PDistasonisATCC8503: string
//     RObeum: string
//     RTorques: string
//     BThetaiotaomicronATCC29148Complemmented: string
//     BThetaiotaomicronATCC29148Mutant: string
//     maximumConcentrationTested: number
// }

export type DbEntry = {
    id: number
    sequence: string
    length: number
    aBaumanniiATCC19606: string
    eColiATCC11775: string
    eColiAIC221: string
    eColiAIC222: string
    kPneumoniaeATCC13883: string
    pAeruginosaPAO1: string
    pAeruginosaPA14: string
    sAureusATCC12600: string
    sAureusATCCBAA1556MRSA: string
    eFaecalisATCC700802VancomycinResistant: string
    eFaeciumATCC700221VancomycinResistant: string
    normalizedHydrophobicMoment: number
    normalizedHydrophobicity: number
    netCharge: number
    isoelectricPoint: number
    penetrationDepth: number
    tiltAngle: number
    disorderedConformationPropensity: number
    linearMoment: number
    propensityToInVitroAggregation: number
    angleSubtendedByTheHydrophobicResidues: number
    amphiphilicityIndex: number
    propensityToPPIICoil: number
    // sourceOrganism: string
    group: string
};

export const ACTIVITY_FIELDS = [
    'aBaumanniiATCC19606',
    'eColiATCC11775',
    'eColiAIC221',
    'eColiAIC222',
    'kPneumoniaeATCC13883',
    'pAeruginosaPAO1',
    'pAeruginosaPA14',
    'sAureusATCC12600',
    'sAureusATCCBAA1556MRSA',
    'eFaecalisATCC700802VancomycinResistant',
    'eFaeciumATCC700221VancomycinResistant'
] as const;

export type ActivityField = typeof ACTIVITY_FIELDS[number];

export type SearchFilterState = {
    idMin: number
    idMax: number
    sequence: string
    organismActivities: ActivityField[]
    activityRangeMin: number
    activityRangeMax: number
    lengthMin: number
    lengthMax: number
    normalizedHydrophobicMomentMin: number
    normalizedHydrophobicMomentMax: number
    NormalizedHydrophobicityMin: number
    NormalizedHydrophobicityMax: number
    NetChargeMin: number
    NetChargeMax: number
    IsoelectricPointMin: number
    IsoelectricPointMax: number
    penetrationDepthMin: number
    penetrationDepthMax: number
    tiltAngleMin: number
    tiltAngleMax: number
    disorderedConformationPropensityMin: number
    disorderedConformationPropensityMax: number
    linearMomentMin: number
    linearMomentMax: number
    propensityToInVitroAggregationMin: number
    propensityToInVitroAggregationMax: number
    angleSubtendedByHydrophobicResiduesMin: number
    angleSubtendedByHydrophobicResiduesMax: number
    amphiphilicityIndexMin: number
    amphiphilicityIndexMax: number
    propensityToPPIICoilMin: number
    propensityToPPIICoilMax: number
    sourceOrganism: string
};

export type FilterObject = {
    min: number
    max: number
    value: string
}



export type Database = {
    entries: DbEntry[]
    entriesArray: string[][]
    headers: string[]
}

export type DbContextType = {
    allEntries: DbEntry[]
    paginatedEntries: DbEntry[]
    headers: string[]
    filters: SearchFilterState
    currentPage: number
    pageSize: number
    sortSettings: SortSettings
    setFilters: (filters: SearchFilterState) => void
    setPageSize: (size: number) => void
    setSortSettings: (sortSettings: SortSettings) => void
    setCurrentPage: (page: number) => void
    changeSortSettings: (fieldName: string) => void
}

export type SortSettings = {
    name: string
    isAscending: boolean
}
