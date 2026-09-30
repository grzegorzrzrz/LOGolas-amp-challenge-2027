import React, { FC } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js';
import { ActiveInactiveChart } from '../charts/ActiveInactiveChart';
import { MicDistributionChart } from '../charts/MicDistributionChart';
import { AminoAcidFrequencyChart } from '../charts/AminoAcidFrequencyChart';
import { AminoAcidCompositionChart } from '../charts/AminoAcidCompositionChart';
import { LengthDistributionChart } from '../charts/LengthDistributionChart';
import { ViolinChartsSection } from '../charts/ViolinChartsSection';
import {appTexts} from "../../texts";

// Register the controllers and elements
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export type StatsProps = {}

export const Stats: FC<StatsProps> = () => {
    return (
        <div className="">
            <div className="max-w-7xl mx-auto py-16 px-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{appTexts.statsTexts.pageTitle}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ActiveInactiveChart />
                    <MicDistributionChart />
                    <AminoAcidFrequencyChart />
                    <AminoAcidCompositionChart />
                    <LengthDistributionChart />
                </div>
                <ViolinChartsSection />
            </div>
        </div>
    );
};
