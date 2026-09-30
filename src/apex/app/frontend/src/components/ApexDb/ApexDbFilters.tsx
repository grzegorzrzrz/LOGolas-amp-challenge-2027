import React, {FC, useState} from 'react';
import clsx from "clsx";
import {useApexDbContext} from "@components/ApexDb/apexDbContext.tsx";
import {TextRangeInput} from "@components/dumb-components/inputs/TextRangeInput.tsx";
import {AppSelect} from "@components/dumb-components/inputs/AppSelect.tsx";
import {TextInput} from "@components/dumb-components/inputs/TextInput.tsx";
import {ChevronRightIcon} from "@heroicons/react/24/outline";
import {appTexts} from "../../texts";

export type FiltersProps = {
    className?: string
}

export const ApexDbFilters: FC<FiltersProps> = ({className}) => {
    const {
        filters,
        setFilters,
    } = useApexDbContext();
    const [showPhysicochemical, setShowPhysicochemical] = useState(false);
    const filterTexts = appTexts.apexDbFiltersTexts;

    const handleRangeFilterChange = (minField, maxField, min: number, max: number) => {
            setFilters({
                ...filters,
                [minField]: min,
                [maxField]: max
            });
    };

    const handleTextFilterChange = (filterName: string, value: string) => {
        setFilters({
            ...filters,
            [filterName]: value
        });
    }

    const handleActivitiesSelectFilterChange = (selectedItems: any[]) => {
        setFilters({
            ...filters,
            organismActivities: selectedItems.map((item) => item.value)
        });
    }

        const basicFilters: (keyof FilterMappingType)[] = ['id', 'length', 'activityRange'];
    const physicochemicalFilters: (keyof FilterMappingType)[] = [
        'netCharge', 'normalizedHydrophobicity', 'normalizedHydrophobicMoment',
        'amphiphilicityIndex', 'isoelectricPoint', 'penetrationDepth', 'tiltAngle',
        'disorderedConformationPropensity', 'linearMoment', 'propensityToInVitroAggregation',
        'angleSubtendedByHydrophobicResidues', 'propensityToPPIICoil'
    ];

    return (
        <div className={clsx(className, "flex flex-col gap-4")}>
            <AppSelect label={filterTexts.targetPathogenLabel} options={activitySelectOptions} placeholder={filterTexts.targetPathogenPlaceholder} onChange={handleActivitiesSelectFilterChange}/>
            <TextInput label={filterTexts.sequenceLabel} placeholder={filterTexts.sequencePlaceholder} value={filters.sequence}
                       onChange={(event) => handleTextFilterChange('sequence', event.target.value)}/>
                {/*<TextInput label="Source organism" placeholder="Enter source organism name"*/}
                {/*           onChange={(event) => handleTextFilterChange('sourceOrganism', event.target.value)}/>*/}
            {basicFilters.map((filterName) => (
                <TextRangeInput
                    key={filterMapping[filterName].label}
                    label={filterTexts.filterLabels[filterName as keyof typeof filterTexts.filterLabels]}
                    onChange={(min, max) => handleRangeFilterChange(filterMapping[filterName].min, filterMapping[filterName].max, min, max)}
                    placeholder={filterMapping[filterName].placeholder || filterTexts.filterPlaceholders[filterName as keyof typeof filterTexts.filterPlaceholders]}
                />
            ))}

            <button 
                onClick={() => setShowPhysicochemical(!showPhysicochemical)}
                className="flex items-center gap-2 text-left p-2 rounded hover:bg-gray-100"
            >
                <ChevronRightIcon 
                    className={clsx(
                        "h-5 w-5 transition-transform duration-200",
                        showPhysicochemical && "transform rotate-90"
                    )}
                />
                {filterTexts.physicochemicalFeaturesButton}
            </button>

            {showPhysicochemical && (
                <div className="flex flex-col gap-4">
                    {physicochemicalFilters.map((filterName) => (
                        <TextRangeInput
                            key={filterMapping[filterName].label}
                            label={filterTexts.filterLabels[filterName as keyof typeof filterTexts.filterLabels]}
                            onChange={(min, max) => handleRangeFilterChange(filterMapping[filterName].min, filterMapping[filterName].max, min, max)}
                            placeholder={filterMapping[filterName].placeholder}
                        />
                    ))}
                </div>
            )}
        </div>
    )
};

type FilterObject = {
    min: string
    max: string
    label: string
    placeholder?: string
}
type FilterMappingType = {
    id: FilterObject
    length: FilterObject
    activityRange: FilterObject
    netCharge: FilterObject
    normalizedHydrophobicMoment: FilterObject
    normalizedHydrophobicity: FilterObject
    amphiphilicityIndex: FilterObject
    isoelectricPoint: FilterObject
    penetrationDepth: FilterObject
    tiltAngle: FilterObject
    disorderedConformationPropensity: FilterObject
    linearMoment: FilterObject
    propensityToInVitroAggregation: FilterObject
    angleSubtendedByHydrophobicResidues: FilterObject
    propensityToPPIICoil: FilterObject
};

const filterMapping: FilterMappingType = {
    id: {min: 'idMin', max: 'idMax', label: 'ID', placeholder: '1, 1-100, 50-'},
    length: {min: 'lengthMin', max: 'lengthMax', label: 'Length', placeholder: '2, 2-50, 5-'},
    activityRange: {min: 'activityRangeMin', max: 'activityRangeMax', label: 'Activity range', placeholder: '2, 2-50, 5-'},
    netCharge: {min: 'NetChargeMin', max: 'NetChargeMax', label: 'Net Charge'},
    normalizedHydrophobicity: {
        min: 'NormalizedHydrophobicityMin',
        max: 'NormalizedHydrophobicityMax',
        label: 'Normalized hydrophobicity'
    },
    normalizedHydrophobicMoment: {
        min: 'normalizedHydrophobicMomentMin',
        max: 'normalizedHydrophobicMomentMax',
        label: 'Normalized hydrophobic moment'
    },
    amphiphilicityIndex: {min: 'amphiphilicityIndexMin', max: 'amphiphilicityIndexMax', label: 'Amphiphilicity index'},
    isoelectricPoint: {min: 'IsoelectricPointMin', max: 'IsoelectricPointMax', label: 'Isoelectric point'},
    penetrationDepth: {min: 'penetrationDepthMin', max: 'penetrationDepthMax', label: 'Penetration depth'},
    tiltAngle: {min: 'tiltAngleMin', max: 'tiltAngleMax', label: 'Tilt Angle'},
    disorderedConformationPropensity: {
        min: 'disorderedConformationPropensityMin',
        max: 'disorderedConformationPropensityMax',
        label: 'Disordered conformation propensity'
    },
    linearMoment: {min: 'linearMomentMin', max: 'linearMomentMax', label: 'Linear moment'},
    propensityToInVitroAggregation: {
        min: 'propensityToInVitroAggregationMin',
        max: 'propensityToInVitroAggregationMax',
        label: 'Propensity to in vitro aggregation'
    },
    angleSubtendedByHydrophobicResidues: {
        min: 'angleSubtendedByHydrophobicResiduesMin',
        max: 'angleSubtendedByHydrophobicResiduesMax',
        label: 'Angle subtended by hydrophobic residues'
    },
    propensityToPPIICoil: {
        min: 'propensityToPPIICoilMin',
        max: 'propensityToPPIICoilMax',
        label: 'Propensity to polyproline type II coil'
    }
}

const activitySelectOptions = [
    {value: 'eColiATCC11775', label: 'E. coli ATCC 11775'},
    {value: 'pAeruginosaPAO1', label: 'P. aeruginosa PAO1'},
    {value: 'pAeruginosaPA14', label: 'P. aeruginosa PA14'},
    {value: 'sAureusATCC12600', label: 'S. aureus ATCC 12600'},
    {value: 'eColiAIC221', label: 'E. coli AIC221'},
    {value: 'eColiAIC222', label: 'E. coli AIC222 - CRE'},
    {value: 'kPneumoniaeATCC13883', label: 'K. pneumoniae ATCC 13883'},
    {value: 'aBaumanniiATCC19606', label: 'A. baumannii ATCC19606'},
    {
        value: 'sAureusATCCBAA1556MRSA',
        label: 'S. aureus (ATCC BAA-1556) - methicillin resistant'
    },
    {value: 'eFaecalisATCC700802VancomycinResistant', label: 'E. faecalis ATCC 700802 - vancomycin-resistant'},
    {value: 'eFaeciumATCC700221VancomycinResistant', label: 'E. faecium ATCC 700221 - vancomycin-resistant'},
    // {value: 'eColiNissle', label: 'E. coli Nissle'},
    // {value: 'salmonellaEntericaATCC9150BEIRESNR515', label: 'Salmonella enterica ATCC 9150 (BEIRES NR-515)'},
    // {value: 'salmonellaEntericaBEIRESNR170', label: 'Salmonella enterica (BEIRES NR-170)'},
    // {value: 'salmonellaEntericaATCC9150BEIRESNR174', label: 'Salmonella enterica ATCC 9150 (BEIRES NR-174)'},
    // {value: 'lMonocytogenesATCC19111BEIRESNR106', label: 'L. monocytogenes ATCC 19111 (BEIRES NR-106)'},
]
