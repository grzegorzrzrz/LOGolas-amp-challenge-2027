import React, { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import { aminoAcidCompositionData } from '../../data/chartData';
import {appTexts} from "../../texts";

export const AminoAcidCompositionChart: FC = () => {
    const texts = appTexts.statsTexts;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{texts.aminoAcidCompositionChartTitle}</h2>
            <div className="flex-1">
                <Bar 
                    data={aminoAcidCompositionData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    autoSkip: false,
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: texts.numberOfOccurrencesLabel
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}; 