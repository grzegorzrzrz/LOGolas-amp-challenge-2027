import React from 'react';
import { Markdown } from "../dumb-components/Markdown";
import {appTexts} from "../../texts";

export default function Publications() {
  const texts = appTexts.publicationsTexts;
  
  const publicationSections = [
    {
      title: texts.apexSectionTitle,
      content: texts.apexContent
    },
    {
      title: texts.molecularDeExtinctionSectionTitle,
      content: texts.molecularDeExtinctionContent
    },
    {
      title: texts.encryptedPeptidesSectionTitle,
      content: texts.encryptedPeptidesContent
    }
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl text-center font-bold text-[#303030] mb-12">{texts.pageTitle}</h1>
        
        {publicationSections.map((section, index) => (
          <section key={index} className="mb-12">
            <div className="bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)] p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-[#303030] mb-6">{section.title}</h2>
              <Markdown>{section.content}</Markdown>
            </div>
          </section>
        ))}

        <div className="flex justify-center mt-8">
          <a
            href="https://delafuentelab.seas.upenn.edu/publications-2/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-300"
          >
            {texts.viewAllButton}
          </a>
        </div>
        
      </div>
    </div>
  );
} 