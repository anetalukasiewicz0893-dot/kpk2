export interface EntityCard {
  type: "entity_card";
  id: string;
  selectable: boolean;
  selected: boolean;
  can_compare: boolean;

  legal_name: string;
  lei: string;
  status: string;
  country: string;
  registration_authority: string;
  entity_category: string;

  addresses: {
    registered: string;
    headquarters: string;
  };

  parents: string[];
  ultimate_parent: string;

  identifiers: string[];
  
  timeline: {
    initial_registration: string;
    last_update: string;
    next_renewal: string;
  };

  risk: {
    entity_status_risk: "Low" | "Medium" | "High";
    country_risk: "Low" | "Medium" | "High";
    sanctions_risk: "Low" | "Medium" | "High";
    overall_score: "Low" | "Medium" | "High";
  };

  sanctions_check: string[];

  registry_links: {
    companies_house: string;
    sec_edgar: string;
    bris: string;
    abn_lookup: string;
    nz_register: string;
  };
}

export interface ComparisonView {
  type: "comparison_view";
  entities: EntityCard[];
  differences: {
    legal_name: string;
    status: string;
    country: string;
    parents: string;
    risk: string;
    sanctions: string;
  };
  similarity_score: string;
  summary: string;
}

export type SearchMode = "name" | "partial" | "lei";
