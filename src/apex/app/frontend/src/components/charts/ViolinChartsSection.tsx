import React, { FC } from 'react';
import {appTexts} from "../../texts";

const violinCharts = [
    {
        titleKey: "tiltAngle" as const,
        image: "/stats/Tilt_Angle_-_website.png"
    },
    {
        titleKey: "propensityToPPIICoil" as const,
        image: "/stats/Propensity_to_PPII_coil_-_website.png"
    },
    {
        titleKey: "propensityToInVitroAggregation" as const,
        image: "/stats/Propensity_to_In_Vitro_Aggregation_-_website.png"
    },
    {
        titleKey: "penetrationDepth" as const,
        image: "/stats/Penetration_Depth_-_website.png"
    },
    {
        titleKey: "normalizedHydrophobicity" as const,
        image: "/stats/Normalized_Hydrophobicity_-_website.png"
    },
    {
        titleKey: "normalizedHydrophobicMoment" as const,
        image: "/stats/Normalized_Hydrophobic_Moment_-_website.png"
    },
    {
        titleKey: "netCharge" as const,
        image: "/stats/Net_Charge_-_website.png"
    },
    {
        titleKey: "linearMoment" as const,
        image: "/stats/Linear_Moment_-_website.png"
    },
    {
        titleKey: "isoelectricPoint" as const,
        image: "/stats/Isoelectric_Point_-_website.png"
    },
    {
        titleKey: "disorderedConformationPropensity" as const,
        image: "/stats/Disordered_Conformation_Propensity_-_website.png"
    },
    {
        titleKey: "angleSubtendedByHydrophobicResidues" as const,
        image: "/stats/Angle_Subtended_by_the_Hydrophobic_Residues_-_website.png"
    },
    {
        titleKey: "amphiphilicityIndex" as const,
        image: "/stats/Amphiphilicity_Index_-_website.png"
    }
];

export const ViolinChartsSection: FC = () => {
    const texts = appTexts.statsTexts;
    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">{texts.featureDistributionTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {violinCharts.map((chart, index) => {
                    const title = texts.violinChartTitles[chart.titleKey];
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
                            <div className="aspect-w-4 aspect-h-3">
                                <img 
                                    src={chart.image} 
                                    alt={title}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 