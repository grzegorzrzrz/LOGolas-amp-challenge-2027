import React from 'react';
import { Citations } from "@components/home/Citations";
import { SequenceForm } from "@components/home/SequenceForm";

export default function HomePageNewPage() {
    return (
        <div className="min-h-screen">
            <SequenceForm />
            <Citations />
        </div>
    );
} 