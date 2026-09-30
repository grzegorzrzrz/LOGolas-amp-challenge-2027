import { useQuery } from '@tanstack/react-query';
import { Database } from '@logic/models';
import dbService from '@logic/db-service';
import { DATASETS, getDatasetByName } from '@config/datasets';

export const useDataset = (datasetName: string = 'apexdb') => {
  const dataset = getDatasetByName(datasetName);
  const filePath = dataset?.filePath;

  return useQuery<Database>({
    queryKey: ['dataset', datasetName],
    queryFn: () => dbService.loadDb(filePath),
    staleTime: Infinity, // CSV files don't change often
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  });
};

