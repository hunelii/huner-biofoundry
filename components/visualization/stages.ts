import { StageData } from './types';

export const STAGES_DATA: StageData[] = [
  {
    id: 'molasses',
    index: 0,
    numberString: '01',
    name: 'Molasses',
    phase: 'Feedstock & Medium',
    shortRole: 'Feedstock Selection',
    headline: 'Characterization of sugar-industry side stream',
    description: 'Sugar-rich molasses is selected and characterized as a potential fungal feedstock.',
    scientificContext: 'Residual sugars, minerals, and nitrogen traces in sugar-industry molasses are screened to establish an optimal, cost-efficient carbon baseline for fungal biomass growth.',
    visualSummary: 'Droplet of viscous molasses entering a dedicated storage and feed tank.'
  },
  {
    id: 'medium-prep',
    index: 1,
    numberString: '02',
    name: 'Medium Preparation',
    phase: 'Feedstock & Medium',
    shortRole: 'Nutrient Formulation',
    headline: 'Formulation and sterilization of liquid medium',
    description: 'The molasses-based medium is prepared to support controlled fungal growth.',
    scientificContext: 'Molasses is diluted, supplemented with essential macro- and micronutrients, and conditioned under mechanical agitation to prepare a balanced liquid broth.',
    visualSummary: 'Preparation vessel with overhead agitator mixing the supplemented liquid growth broth.'
  },
  {
    id: 'fungal-culture',
    index: 2,
    numberString: '03',
    name: 'Fungal Culture',
    phase: 'Cultivation & Fermentation',
    shortRole: 'Strain Isolation',
    headline: 'Preparation of pure Tuber melanosporum isolate',
    description: 'An identified Tuber melanosporum culture is prepared for cultivation.',
    scientificContext: 'A verified strain of Tuber melanosporum is revived on solid agar and pre-cultured in liquid shake-flasks to reach active vegetative mycelial vitality without contamination.',
    visualSummary: 'Petri dish showing radiating mycelial growth and an Erlenmeyer pre-culture flask.'
  },
  {
    id: 'inoculation',
    index: 3,
    numberString: '04',
    name: 'Inoculation',
    phase: 'Cultivation & Fermentation',
    shortRole: 'Bioreactor Seeding',
    headline: 'Transfer of vegetative culture into growth medium',
    description: 'The fungal culture is introduced into the prepared growth medium.',
    scientificContext: 'The active mycelial suspension is aseptically transferred into the prepared cultivation vessel, establishing a viable inoculum density for submerged growth.',
    visualSummary: 'Aseptic transfer port introducing mycelial inoculum into the liquid culture vessel.'
  },
  {
    id: 'fermentation',
    index: 4,
    numberString: '05',
    name: 'Fermentation',
    phase: 'Cultivation & Fermentation',
    shortRole: 'Submerged Cultivation',
    headline: 'Controlled mycelial propagation in liquid culture',
    description: 'The fungus grows in liquid culture as growth and process conditions are monitored.',
    scientificContext: 'Tuber melanosporum mycelium proliferates in submerged fermentation. Growth dynamics and metabolic states are tracked in real time across 5 core sensor parameters.',
    parameters: ['Temperature', 'pH', 'Dissolved oxygen', 'Biomass', 'Process data'],
    visualSummary: 'Main glass-walled bioreactor with submerged hyphal network and real-time process monitoring.'
  },
  {
    id: 'sampling',
    index: 5,
    numberString: '06',
    name: 'Sampling',
    phase: 'Analysis & Feedback',
    shortRole: 'Aliquot Screening',
    headline: 'Sterile collection of culture aliquots',
    description: 'Samples are collected to examine biomass and potential aroma-related compounds.',
    scientificContext: 'Timed sterile broth samples are drawn through a dedicated sampling manifold to monitor biomass accumulation and track the emergence of volatile metabolites.',
    visualSummary: 'Sanitary sampling manifold with collection tubes capturing culture aliquots.'
  },
  {
    id: 'aroma-analysis',
    index: 6,
    numberString: '07',
    name: 'Aroma Analysis',
    phase: 'Analysis & Feedback',
    shortRole: 'Volatile Profiling',
    headline: 'Sensory screening and volatile compound profiling',
    description: 'Volatile compounds are profiled, and suitable samples undergo sensory evaluation.',
    scientificContext: 'Broth volatiles are analyzed using chromatography and sensory evaluation to identify characteristic truffle aroma notes and evaluate their intensity.',
    visualSummary: 'Analytical detector with reticle focus and volatile chromatographic peak display.'
  },
  {
    id: 'ingredient-dev',
    index: 7,
    numberString: '08',
    name: 'Ingredient Development',
    phase: 'Downstream Formulation',
    shortRole: 'Food Application',
    headline: 'Target ingredient specification for food producers',
    description: 'Promising results guide the development of a consistent truffle-character ingredient.',
    scientificContext: 'Analytical and sensory insights guide downstream extraction, carrier formulation, and matrix stability testing for commercial food manufacturing applications.',
    visualSummary: 'Standardized aroma ingredient profile branching towards culinary application matrices.'
  }
];

export const PROCESS_META = {
  sectionTag: 'TUBER MELANOSPORUM · SUBMERGED FERMENTATION · RESEARCH & DEVELOPMENT',
  mainTitle: 'From Molasses to a Truffle-Character Ingredient',
  subtitle: 'Exploring how controlled fungal fermentation can transform sugar-industry side streams into potential high-value aroma ingredients.',
  summaryTakeaway: '01 Molasses → 02 Medium Preparation → 03 Fungal Culture → 04 Inoculation → 05 Fermentation → 06 Sampling → 07 Aroma Analysis → 08 Ingredient Development',
  footerTagline: 'Biology. Engineering. Evidence. Developing reproducible fungal processes through controlled experimentation and analytical validation.',
  disclaimer: 'Early-stage research and development. Schematic representation of our experimental pathway — not a depiction of industrial facility equipment or commercial product availability.'
};
