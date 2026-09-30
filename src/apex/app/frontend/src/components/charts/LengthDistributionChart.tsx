import React, { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import { lengthDistributionData } from '../../data/chartData';
import {appTexts} from "../../texts";

export const LengthDistributionChart: FC = () => {
    const texts = appTexts.statsTexts;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{texts.lengthDistributionChartTitle}</h2>
            <div className="flex-1">
                <Bar 
                    data={lengthDistributionData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: texts.normalizedFrequencyLabel
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: texts.lengthLabel
                                },
                                ticks: {
                                    minRotation: 0,
                                    maxRotation: 0
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}; 