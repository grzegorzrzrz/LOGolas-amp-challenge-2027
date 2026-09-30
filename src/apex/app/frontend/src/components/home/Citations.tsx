import React from 'react';
import { Markdown } from "../dumb-components/Markdown";
import { appTexts } from "../../texts";

export function Citations() {
  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-[#303030] mb-6">{appTexts.citationsTexts.heading}</h2>
        
        <div className="bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)] p-6 mb-6">
          <Markdown>
            {appTexts.homeTexts.citationsAndAttribution}
          </Markdown>
        </div>         
      </div>
    </section>
  );
} 