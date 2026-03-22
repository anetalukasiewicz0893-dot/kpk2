import { EntityCard, SearchMode } from "../types";

export const searchEntities = async (query: string, mode: SearchMode): Promise<EntityCard[]> => {
  try {
    const response = await fetch(`/api/lei/search?query=${encodeURIComponent(query)}&mode=${mode}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    const rawApiData = await response.json();

    // The GLEIF API returns data in a 'data' array or object (JSON:API format)
    const data = rawApiData.data;
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    
    return records.map((record: any): EntityCard => {
      const attr = record.attributes;
      const entity = attr.entity;
      const reg = attr.registration;

      const formatAddress = (addr: any) => {
        if (!addr) return "N/A";
        const lines = addr.addressLines || [];
        return `${lines.join(", ")}, ${addr.city}, ${addr.country}`;
      };

      return {
        type: "entity_card",
        id: record.id,
        selectable: true,
        selected: false,
        can_compare: false, // Disabling comparison as it was AI-powered

        legal_name: entity.legalName?.name || "N/A",
        lei: attr.lei,
        status: reg.registrationStatus || "N/A",
        country: entity.legalAddress?.country || "N/A",
        registration_authority: entity.registrationAuthority?.registrationAuthorityId || "N/A",
        entity_category: entity.entityCategory || "N/A",

        addresses: {
          registered: formatAddress(entity.legalAddress),
          headquarters: formatAddress(entity.headquartersAddress)
        },

        parents: [], // Parent data requires separate relationship API calls in GLEIF
        ultimate_parent: "N/A",

        identifiers: [],
        
        timeline: {
          initial_registration: reg.initialRegistrationDate || "N/A",
          last_update: reg.lastUpdateDate || "N/A",
          next_renewal: reg.nextRenewalDate || "N/A"
        },

        risk: {
          entity_status_risk: reg.registrationStatus === "ISSUED" ? "Low" : "High",
          country_risk: "Low",
          sanctions_risk: "Low",
          overall_score: reg.registrationStatus === "ISSUED" ? "Low" : "Medium"
        },

        sanctions_check: ["Not performed (AI disabled)"],

        registry_links: {
          gleif_verify: `https://search.gleif.org/#/record/${attr.lei}`,
          companies_house: `https://find-and-update.company-information.service.gov.uk/search?q=${encodeURIComponent(entity.legalName?.name || "")}`,
          sec_edgar: `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(entity.legalName?.name || "")}`,
          bris: `https://e-justice.europa.eu/rei/search?query=${encodeURIComponent(entity.legalName?.name || "")}`,
          abn_lookup: `https://abr.business.gov.au/Search/ResultsActive?SearchText=${encodeURIComponent(entity.legalName?.name || "")}`,
          nz_register: `https://companies-register.companiesoffice.govt.nz/companies?query=${encodeURIComponent(entity.legalName?.name || "")}`
        }
      };
    });
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
};

// These were AI powered, removing their functionality as requested
export const generateComparisonSummary = async (): Promise<any> => {
  throw new Error("AI Comparison is disabled.");
};

export const performDeepInvestigation = async (): Promise<string> => {
  return "Deep investigation is disabled (AI features removed).";
};
