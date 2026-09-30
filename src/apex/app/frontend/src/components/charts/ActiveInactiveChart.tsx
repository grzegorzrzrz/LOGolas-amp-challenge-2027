import React, { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import { activeVsInactiveData } from '../../data/chartData';
import {appTexts} from "../../texts";

export const ActiveInactiveChart: FC = () => {
    const texts = appTexts.statsTexts;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{texts.activeInactiveChartTitle}</h2>
            <div className="flex-1">
                <Bar 
                    data={activeVsInactiveData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    autoSkip: false,
                                    font: {
                                        size: 14
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}; 