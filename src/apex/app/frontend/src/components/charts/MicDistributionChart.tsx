import React, { FC } from 'react';
import { Pie } from 'react-chartjs-2';
import { micDistributionData } from '../../data/chartData';
import {appTexts} from "../../texts";

export const MicDistributionChart: FC = () => {
    const texts = appTexts.statsTexts;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{texts.micDistributionChartTitle}</h2>
            <div className="flex-1">
                <Pie 
                    data={micDistributionData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}; 