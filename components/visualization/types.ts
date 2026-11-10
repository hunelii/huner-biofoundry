export type StageId =
  | 'molasses'
  | 'medium-prep'
  | 'fungal-culture'
  | 'inoculation'
  | 'fermentation'
  | 'sampling'
  | 'aroma-analysis'
  | 'ingredient-dev';

export interface StageData {
  id: StageId;
  index: number;
  numberString: string;
  name: string;
  phase: string;
  shortRole: string;
  headline: string;
  description: string;
  scientificContext: string;
  parameters?: string[];
  visualSummary: string;
}
