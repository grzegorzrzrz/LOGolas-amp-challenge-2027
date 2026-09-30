const homeTexts = {
    title: "Give us your peptides",
    titleButtonText: "Upload",
    titleButtonPlaceholder: "Enter your sequence in FASTA format here...",
    stats: [
        {name: "Monomer", value: 233},
        {name: "Multimer", value: 1000},
        {name: "Multi Peptide", value: 9000}
    ],
    uploadDescription: "Give us your peptides",
    uploadButton: "Upload file",
    apexDbDescription: "Explore our existing database with some sequences",
    apexDbButton: "Explore APEX DB",
    downloadDbDescription: "Download our database to check it out locally",
    downloadDbButton: "Download APEX DB csv",
    citationsAndAttribution: `
[Torres, M.D.T.; Wan, F.; de la Fuente-Nunez, C. Antibiotic Discovery for all with APEXSEARCH. XX, X, XX-XX, 2025. DOI: X](X)

[Torres, M. D. T.; Wan, F.; de la Fuente-Nunez, C. Deep learning reveals antibiotics in the archaeal proteome, Nature Microbiology, 10, 2153-2167, 2025. DOI: 10.1038/s41564-025-02061-0.](https://www.nature.com/articles/s41564-025-02061-0)
`
}

const aboutTexts = {
    title: "The Lab",
    text: `## About us

De la Fuente Lab/Machine Biology Group

We use the power of machines to accelerate discoveries in biology and medicine

## CONTACT

Cesar de la Fuente, Ph.D. (cfuente@upenn.edu)

To apply to become a graduate student in the lab, please first apply to a Ph.D. program at the University of Pennsylvania. For other positions, please contact Prof. Cesar de la Fuente.

Website: [delafuentelab.seas.upenn.edu](https://delafuentelab.seas.upenn.edu/)
`,
    downloadFileDescription:"Previous work can be downloaded here:",
    downloadFileButton:"Download",
}

const sequenceFormTexts = {
    title: "Discover your own antibiotics",
    titleTooltip: "Here you can upload your peptide/protein sequences (one-letter code amino acid) and have them analyzed by our AI. This may take a few minutes. Once it is done, you will receive the results by email.",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email",
    emailTooltip: "We will use this email to send you the results of your analysis.",
    sequenceLabel: "Sequence",
    sequencePlaceholder: "Enter your peptide/protein sequence (one-letter code amino acid) in FASTA format here...",
    sequenceTooltip: "You can upload a FASTA file or enter your peptide/protein sequence (one-letter code amino acid) manually. The sequence should be in FASTA format.",
    characterCount: "/20000",
    submitting: "Submitting...",
    submitButton: "Submit",
    orDivider: "- OR -",
    enterManuallyButton: "Enter sequence manually",
    uploadFileButton: "Upload FASTA file",
    selectedFile: "Selected file: ",
    submitSuccess: "Successfully submitted!",
    submitError: "Failed to submit. Please try again.",
}

const publicationsTexts = {
    pageTitle: "Publications",
    apexSectionTitle: "APEX",
    molecularDeExtinctionSectionTitle: "Molecular de-extinction",
    encryptedPeptidesSectionTitle: "Encrypted peptides",
    viewAllButton: "View All Publications",
    apexContent: `
[Wan, F.; Torres, M.D.T.; Peng, J.; de la Fuente-Nunez, C. Deep-learning-enabled antibiotic discovery through molecular de-extinction. Nature Biomedical Engineering, 8, 854–871, 2024. DOI: 10.1038/s41551-024-01201-x.](https://www.nature.com/articles/s41551-024-01201-x)

[Wan, F.; Torres, M. D. T.; Guan, C.; de la Fuente-Nunez, C. Tutorial: guidelines for the use of machine learning methods to mine genomes and proteomes for antibiotic discovery. Nature Protocols, 20, 2685-2697, 2025. DOI: 10.1038/s41596-025-01144-w.](https://www.nature.com/articles/s41596-025-01144-w)

[Guan, C.; Torres, M.D.T.; Li, S.; de la Fuente-Nunez, C. Computational exploration of global venoms for antimicrobial discovery with Venomics artificial intelligence. Nature Communications, 16, 6446, 2025. DOI: 10.1038/s41467-025-60051-6.](https://www.nature.com/articles/s41467-025-60051-6)

[Torres, M. D. T.; Wan, F.; de la Fuente-Nunez, C. Deep learning reveals antibiotics in the archaeal proteome, Nature Microbiology, 10, 2153-2167, 2025. DOI: https://doi.org/10.1038/s41564-025-02061-0](https://doi.org/10.1038/s41564-025-02061-0)

[Cesaro, A.; Wan, F.; Torres, M.D.T.; de la Fuente-Nunez, C. Design of multimodal antibiotics against intracellular infections using deep learning. bioRXiv, 2025.](https://www.biorxiv.org/content/10.1101/2024.12.20.629780v2)

[Leng, T.; Wan, F.; Torres, M. D. T.; de la Fuente-Nunez, C. Predicting and generating antibiotics against future pathogens with ApexOracle. arXiv, 2025.](https://arxiv.org/abs/2507.07862)

[Torres, M.D.T.; Zeng, Y.; Wan, F.; Maus, N.; Gardner, J.; de la Fuente-Nunez, C. A generative artificial intelligence approach for antibiotic optimization. bioRXiv, 2025.](https://www.biorxiv.org/content/10.1101/2024.11.27.625757v1)

[Xia, X.; Torres, M.D.T.; de la Fuente-Nunez, C. Proteasome-derived antimicrobial peptides discovered via deep learning. bioRXiv, 2025.](https://www.biorxiv.org/content/10.1101/2025.03.17.643752v1.abstract)`,
    molecularDeExtinctionContent: `
[Maasch, J.R.M.A.; Torres, M.D.T.; Melo, M.C.R.; de la Fuente-Nunez, C. Molecular de-extinction of ancient antimicrobial peptides enabled by machine learning. Cell Host Microbe, v. 31, i. 8, p. 1260-1274.E6, 2023. DOI: 10.1016/j.chom.2023.07.001](https://www.sciencedirect.com/science/article/pii/S1931312823002962?via%3Dihub)

[Torrance, A.W.; de la Fuente-Nunez, C. The patentability and bioethics of molecular de-extinction. Nature Biotechnology, 42, 1179-1180, 2024. DOI: 10.1038/s41587-024-02332-x](https://www.nature.com/articles/s41587-024-02332-x)`,
    encryptedPeptidesContent: `
[Torres, M.D.T.; Melo, M.C.R.; Flowers, L.; Crescenzi, O.; Notomista, E.; de la Fuente-Nunez, C. Mining for encrypted peptide antibiotics in the human proteome. Nature Biomedical Engineering, v. 6, i. 1, p. 67-75, 2022. DOI: 10.1038/s41551-021-00801-1](https://www.nature.com/articles/s41551-021-00801-1)

[Torres, M.D.T.; Cesaro, A.; de la Fuente-Nunez, C. Encrypted peptides from the human proteome target infections through antimicrobial and immunomodulatory properties. Trends in Biotechnology, 2024. DOI: 10.1016/j.tibtech.2024.09.008](https://www.cell.com/trends/biotechnology/fulltext/S0167-7799(24)00251-8)

[Torres, M.D.T.; Brooks, E.; Cesaro, A.; Sberro, H.; Nicolaou, C.; Bhatt, A.S.; de la Fuente-Nunez, C. Human gut metagenomic mining reveals an untapped source of peptide antibiotics. Cell, v. 187, i. 19, p. 5453-5467.E152024. DOI: 10.1016/j.cell.2024.07.027](https://www.cell.com/cell/fulltext/S0092-8674(24)00802-X)

[Santos-Junior, C.D.; Torres, M.D.T.; Duas, Y.; del Rio, A.R.; Schmidt, T.S.B.; Chong, H.; Fullam, A.; Kuhn, M.; Zhu, C.; Houseman, A.; Somborski, J.; Vines, A.; Zhao, X.M.; Bork, P.; Huerta-Cepas, J.; de la Fuente-Nunez, C., Coelho, L.P. Computational exploration of the global microbiome for antibiotic discovery. Cell, v. 187, i. 14, p. 3761-3778.E16, 2024. DOI: 10.1016/j.cell.2024.05.013](https://www.cell.com/cell/fulltext/S0092-8674(24)00522-1)`,
}

const statsTexts = {
    pageTitle: "Stats",
    activeInactiveChartTitle: "Active vs Inactive Distribution",
    micDistributionChartTitle: "Activity Value Frequency (μmol L-1)",
    aminoAcidFrequencyChartTitle: "Amino Acid Residue Frequency",
    aminoAcidCompositionChartTitle: "Amino Acid Composition",
    lengthDistributionChartTitle: "Length Distribution",
    featureDistributionTitle: "Feature Distribution",
    frequencyLabel: "Frequency",
    normalizedFrequencyLabel: "Normalized Frequency",
    lengthLabel: "Length",
    numberOfOccurrencesLabel: "Number of Occurrences",
    violinChartTitles: {
        tiltAngle: "Tilt Angle",
        propensityToPPIICoil: "Propensity to PPII coil",
        propensityToInVitroAggregation: "Propensity to In Vitro Aggregation",
        penetrationDepth: "Penetration Depth",
        normalizedHydrophobicity: "Normalized Hydrophobicity",
        normalizedHydrophobicMoment: "Normalized Hydrophobic Moment",
        netCharge: "Net Charge",
        linearMoment: "Linear Moment",
        isoelectricPoint: "Isoelectric Point",
        disorderedConformationPropensity: "Disordered Conformation Propensity",
        angleSubtendedByHydrophobicResidues: "Angle Subtended by the Hydrophobic Residues",
        amphiphilicityIndex: "Amphiphilicity Index",
    }
}

const peptideDetailsTexts = {
    detailsIntro: "Here are the details for peptide:",
    goBack: "Go Back",
}

const navbarTexts = {
    brandName: "ApexSearch",
    menuItems: {
        home: "Home",
        apexDb: "ApexDB",
        stats: "ApexDB Stats",
        publications: "Publications",
        about: "The Lab",
    }
}

const footerTexts = {
    copyright: "© 2026 The Trustees of the University of Pennsylvania. All Rights Reserved. Created by Dr. Cesar de la Fuente/Machine Biology Group/de la Fuente Lab.",
    legalLink: "Legal",
}

const citationsTexts = {
    heading: "Please cite: ",
}

const apexDbHeaderTexts = {
    title: "Database",
    description: "All the sequences used to train Apex.",
    downloadButton: "Download Database.csv",
}

const apexDbFiltersTexts = {
    targetPathogenLabel: "Target Pathogen",
    targetPathogenPlaceholder: "Select one or multiple",
    sequenceLabel: "Sequence",
    sequencePlaceholder: "Enter sequence or motif",
    physicochemicalFeaturesButton: "Physicochemical Features",
    filterLabels: {
        id: "ID",
        length: "Length",
        activityRange: "Activity range",
        netCharge: "Net Charge",
        normalizedHydrophobicity: "Normalized hydrophobicity",
        normalizedHydrophobicMoment: "Normalized hydrophobic moment",
        amphiphilicityIndex: "Amphiphilicity index",
        isoelectricPoint: "Isoelectric point",
        penetrationDepth: "Penetration depth",
        tiltAngle: "Tilt Angle",
        disorderedConformationPropensity: "Disordered conformation propensity",
        linearMoment: "Linear moment",
        propensityToInVitroAggregation: "Propensity to in vitro aggregation",
        angleSubtendedByHydrophobicResidues: "Angle subtended by hydrophobic residues",
        propensityToPPIICoil: "Propensity to polyproline type II coil",
    },
    filterPlaceholders: {
        id: "1, 1-100, 50-",
        length: "2, 2-50, 5-",
        activityRange: "2, 2-50, 5-",
    }
}

const dropzoneTexts = {
    processing: "Processing...",
    dropFile: "Drop file",
    toUpload: "to upload",
    clickToUpload: "Click to upload",
    dragAndDrop: "drag and drop",
    fastaFilesOnly: "FASTA files only",
    fileTooLargePrefix: "File \"",
    fileTooLargeSuffix: "\" is too large. Maximum file size is 50MB.",
    invalidFileSuffix: " is not a valid FASTA file",
}

const chartTexts = {
    // Chart titles are in statsTexts
}

const commonTexts = {
    view: "View",
    submit: "Submit",
    download: "Download",
    select: "Select...",
    loadingDataset: "Loading dataset...",
    errorLoadingDataset: "Error loading dataset:",
}

const cookieBannerTexts = {
    message: "This site uses cookies for its base functionalities and protection.",
    dismissButton: "Dismiss",
}

const legalTexts = {
    pageTitle: "Legal",
    content: `## Terms and Conditions

The services provided through this website, including the "Discover your own antibiotics" functionality, are free to use.
We provide these features to illustrate our research and to share it with the scientific community. You may use them within a reasonable volume.
We may deactivate the services temporarily or permanently in case of maintenance or other circumstances.

## Privacy Policy

1. Information you provide directly

Using the "Discover your own antibiotics" functionality requires an e-mail address for the sole purpose of sending you the results. By using this service, you agree to providing your e-mail for this purpose.
We will never use this e-mail outside of providing the functionality of this feature, specifically we will never contact you via this e-mail for advertising purposes. Furthermore, we will not give away your e-mail address to any third parties.

2. Information collected automatically by the hosting server

The server used for hosting our services belong to the University of Pennsylvania. These servers might collect anonymous data such as user IP address, location, or other activity on our site. This tracking is GDPR-compliant and does not involve any personally identifying information. By using our website you agree to this.

## Cookie Policy

This site only uses cookies necessary to its base functionalities and protection. By using the website you agree to these cookies.

## Intellectual Property

This website and its contents belong to De la Fuente Lab/Machine Biology Group.

## Contact Information

Cesar de la Fuente, Ph.D. (cfuente@upenn.edu)

Website: [delafuentelab.seas.upenn.edu](https://delafuentelab.seas.upenn.edu/)
`
}

const ApexDbTexts = {
    filters: {
        title: "Filters",
        genomeQualityLabel: "Genome quality",
        genomeQualityLow: "Only Low",
        genomeQualityMedium: "Only Medium",
        genomeQualityHigh: "Only High",
        passGnucLabel: "Pass GNUC",
        passGnucAll: "All GNUC",
        passGnucYes: "Yes",
        passGnucNo: "No",
        clearFiltersButton: "Clear all filters",
        completenessLabel: "Completeness",
        contaminationLabel: "Contamination",
        trnaLabel: "tRNA",
        s16Label: "16S",
        s5Label: "5S",
        s23Label: "23S",
        highQualityGenomesCountLabel: "High quality genomes: ",
        mediumQualityGenomesCountLabel: "Medium quality genomes: ",
        lowQualityGenomesCountLabel: "Low quality genomes: ",
        excludeLowQualityBins: "Exclude low quality bins",
        excludeMediumQualityBins: "Exclude medium quality bins",
        excludeHighQualityBins: "Exclude high quality bins",
    },
    pagination: {
        itemsPerPage: "per page",
        itemsCountLabel: "%{from}-%{to} of %{count}",
        pagesCountLabel: "of %{count}",
        previous: "Previous",
        next: "Next",
    },
    table: {
        IdLabel: "ID",
        sequenceLabel: "Sequence",
        LengthLabel: "Length",
        hydrophobicMomentLabel: "Hydrophobic moment",
        detailsButtonLabel: "View",
    }
}


export const appTexts = {
    homeTexts,
    aboutTexts,
    sequenceFormTexts,
    publicationsTexts,
    statsTexts,
    peptideDetailsTexts,
    navbarTexts,
    footerTexts,
    citationsTexts,
    apexDbHeaderTexts,
    apexDbFiltersTexts,
    dropzoneTexts,
    chartTexts,
    commonTexts,
    ApexDbTexts,
    cookieBannerTexts,
    legalTexts,
}





