import {ActivityField, ACTIVITY_FIELDS, DbEntry, SearchFilterState, SortSettings} from "@logic/models.ts";

export function filterApexDb(entries: DbEntry[], filters: SearchFilterState): DbEntry[] {
    const activityFields = filters.organismActivities.length > 0 
    ? filters.organismActivities 
    : ACTIVITY_FIELDS;

    return entries    
        .filter(entry => {
            const activityInRange = activityFields.some(field => {
                const value = Number(entry[field]);
                return !isNaN(value) && 
                       (filters.activityRangeMin === undefined || value >= filters.activityRangeMin) &&
                       (filters.activityRangeMax === undefined || value <= filters.activityRangeMax);
            });
            
            return (
                (filters.idMin === undefined || entry.id >= filters.idMin) &&
                (filters.idMax === undefined || entry.id <= filters.idMax) &&
                (!filters.sequence || entry.sequence.toLowerCase().includes(filters.sequence.toLowerCase())) &&
                (filters.organismActivities.length === 0 || filters.organismActivities.every(activity => !isNaN(Number(entry[activity])))) &&
                ((filters.activityRangeMin === undefined && filters.activityRangeMax === undefined) || activityInRange) &&
                (filters.lengthMin === undefined || entry.length >= filters.lengthMin) &&
                (filters.lengthMax === undefined || entry.length <= filters.lengthMax) &&
                (filters.normalizedHydrophobicMomentMin === undefined || entry.normalizedHydrophobicMoment >= filters.normalizedHydrophobicMomentMin) &&
                (filters.normalizedHydrophobicMomentMax === undefined || entry.normalizedHydrophobicMoment <= filters.normalizedHydrophobicMomentMax) &&
                (filters.NormalizedHydrophobicityMin === undefined || entry.normalizedHydrophobicity >= filters.NormalizedHydrophobicityMin) &&
                (filters.NormalizedHydrophobicityMax === undefined || entry.normalizedHydrophobicity <= filters.NormalizedHydrophobicityMax) &&
                (filters.NetChargeMin === undefined || entry.netCharge >= filters.NetChargeMin) &&
                (filters.NetChargeMax === undefined || entry.netCharge <= filters.NetChargeMax) &&
                (filters.IsoelectricPointMin === undefined || entry.isoelectricPoint >= filters.IsoelectricPointMin) &&
                (filters.IsoelectricPointMax === undefined || entry.isoelectricPoint <= filters.IsoelectricPointMax) &&
                (filters.penetrationDepthMin === undefined || entry.penetrationDepth >= filters.penetrationDepthMin) &&
                (filters.penetrationDepthMax === undefined || entry.penetrationDepth <= filters.penetrationDepthMax) &&
                (filters.tiltAngleMin === undefined || entry.tiltAngle >= filters.tiltAngleMin) &&
                (filters.tiltAngleMax === undefined || entry.tiltAngle <= filters.tiltAngleMax) &&
                (filters.disorderedConformationPropensityMin === undefined || entry.disorderedConformationPropensity >= filters.disorderedConformationPropensityMin) &&
                (filters.disorderedConformationPropensityMax === undefined || entry.disorderedConformationPropensity <= filters.disorderedConformationPropensityMax) &&
                (filters.linearMomentMin === undefined || entry.linearMoment >= filters.linearMomentMin) &&
                (filters.linearMomentMax === undefined || entry.linearMoment <= filters.linearMomentMax) &&
                (filters.propensityToInVitroAggregationMin === undefined || entry.propensityToInVitroAggregation >= filters.propensityToInVitroAggregationMin) &&
                (filters.propensityToInVitroAggregationMax === undefined || entry.propensityToInVitroAggregation <= filters.propensityToInVitroAggregationMax) &&
                (filters.angleSubtendedByHydrophobicResiduesMin === undefined || entry.angleSubtendedByTheHydrophobicResidues >= filters.angleSubtendedByHydrophobicResiduesMin) &&
                (filters.angleSubtendedByHydrophobicResiduesMax === undefined || entry.angleSubtendedByTheHydrophobicResidues <= filters.angleSubtendedByHydrophobicResiduesMax) &&
                (filters.amphiphilicityIndexMin === undefined || entry.amphiphilicityIndex >= filters.amphiphilicityIndexMin) &&
                (filters.amphiphilicityIndexMax === undefined || entry.amphiphilicityIndex <= filters.amphiphilicityIndexMax) &&
                (filters.propensityToPPIICoilMin === undefined || entry.propensityToPPIICoil >= filters.propensityToPPIICoilMin) &&
                (filters.propensityToPPIICoilMax === undefined || entry.propensityToPPIICoil <= filters.propensityToPPIICoilMax)
                // (!filters.sourceOrganism || entry.sourceOrganism.toLowerCase().includes(filters.sourceOrganism.toLowerCase()))
            );
        });
}

export function sortApexDb(items: DbEntry[], fieldName: string, isAscending: boolean): DbEntry[] {
    const sorted = [...items].sort((a, b) => {
        if (a[fieldName] < b[fieldName]) {
            return isAscending ? 1 : -1
        }
        if (a[fieldName] > b[fieldName]) {
            return isAscending ? -1 : 1
        }
        return 0
    });
    return sorted;
}

export const defaultFilterState: SearchFilterState = {
    idMin: undefined,
    idMax: undefined,
    sequence: undefined,
    organismActivities: [],
    activityRangeMin: undefined,
    activityRangeMax: undefined,
    lengthMin: undefined,
    lengthMax: undefined,
    normalizedHydrophobicMomentMin: undefined,
    normalizedHydrophobicMomentMax: undefined,
    NormalizedHydrophobicityMin: undefined,
    NormalizedHydrophobicityMax: undefined,
    NetChargeMin: undefined,
    NetChargeMax: undefined,
    IsoelectricPointMin: undefined,
    IsoelectricPointMax: undefined,
    penetrationDepthMin: undefined,
    penetrationDepthMax: undefined,
    tiltAngleMin: undefined,
    tiltAngleMax: undefined,
    disorderedConformationPropensityMin: undefined,
    disorderedConformationPropensityMax: undefined,
    linearMomentMin: undefined,
    linearMomentMax: undefined,
    propensityToInVitroAggregationMin: undefined,
    propensityToInVitroAggregationMax: undefined,
    angleSubtendedByHydrophobicResiduesMin: undefined,
    angleSubtendedByHydrophobicResiduesMax: undefined,
    amphiphilicityIndexMin: undefined,
    amphiphilicityIndexMax: undefined,
    propensityToPPIICoilMin: undefined,
    propensityToPPIICoilMax: undefined,
    sourceOrganism: undefined
}

export const getNewSortSettings = (fieldName: string, currentSortSettings: SortSettings): SortSettings => {
    if (fieldName === currentSortSettings.name) {
        return{ name: fieldName, isAscending: !currentSortSettings.isAscending }
    } else {
        return { name: fieldName, isAscending: true }
    }
}

export const defaultSortSettings = {name: "", isAscending: true};
export const defaultPageSize = 50;
export const pageSizeOptions = [{label: 50, value: 50}, {label: 100, value: 100}, {label: 200, value: 200}]
