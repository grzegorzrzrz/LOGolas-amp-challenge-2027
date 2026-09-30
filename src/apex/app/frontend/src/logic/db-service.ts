import {Database, DbEntry} from "./models";

async function loadDb(filepath: string): Promise<Database> {
    // load csv file function
    filepath = filepath || '/APEXDB.csv';
    const text = await fetch(filepath).then((response) => response.text());
    const entries: DbEntry[] = [];
    const entriesArray: string[][] = [];

    const lines = text.split('\n')
                      .filter(x => x.length > 0);


    const headerLine = lines.shift();
    if (headerLine === undefined) throw Error("error parsing DB: DB empty");
    const headerFields = headerLine.split(',');

    lines.forEach((line, index) => {
        const fields = line.split(',');

        const entry: DbEntry = {
            id: parseInt(fields[0], 10),
            sequence: fields[1],
            length: +fields[2],
            aBaumanniiATCC19606: fields[3],
            eColiATCC11775: fields[4],
            eColiAIC221: fields[5],
            eColiAIC222: fields[6],
            kPneumoniaeATCC13883: fields[7],
            pAeruginosaPAO1: fields[8],
            pAeruginosaPA14: fields[9],
            sAureusATCC12600: fields[10],
            sAureusATCCBAA1556MRSA: fields[11],
            eFaecalisATCC700802VancomycinResistant: fields[12],
            eFaeciumATCC700221VancomycinResistant: fields[13],
            normalizedHydrophobicMoment: +fields[14],
            normalizedHydrophobicity: +fields[15],
            netCharge: +fields[16],
            isoelectricPoint: +fields[17],
            penetrationDepth: +fields[18],
            tiltAngle: +fields[19],
            disorderedConformationPropensity: +fields[20],
            linearMoment: +fields[21],
            propensityToInVitroAggregation: +fields[22],
            angleSubtendedByTheHydrophobicResidues: +fields[23],
            amphiphilicityIndex: +fields[24],
            propensityToPPIICoil: +fields[25],
            group: fields[26],
            //sourceOrganism: fields[27],
        }

        entries.push(entry);
        entriesArray.push(fields);
    })

    return {entries, entriesArray, headers: headerFields};
}


const dbService = {
    loadDb
}

export default dbService;
