export type DatasetConfig = {
  name: string;
  filePath: string;
}

export const DATASETS: DatasetConfig[] = [
  {
    name: 'apexdb',
    filePath: '/APEXDB.csv',
  },
  // Add more datasets here
//   {
//     name: 'apex2',
//     filePath: '/APEXDB2.csv',
//   }
];

export const getDatasetByName = (name: string): DatasetConfig | undefined => {
  return DATASETS.find(d => d.name === name);
};

