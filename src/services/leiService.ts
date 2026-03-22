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
    const included = rawApiData.included || [];
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    
    return records.map((record: any): EntityCard => {
      const attr = record.attributes;
      const entity = attr.entity;
      const reg = attr.registration;
      const rels = record.relationships || {};

      const getParentName = (relType: string) => {
        const relData = rels[relType]?.data;
        if (!relData) return "N/A";
        const parentRecord = included.find((inc: any) => inc.type === relData.type && inc.id === relData.id);
        return parentRecord?.attributes?.entity?.legalName?.name || relData.id || "N/A";
      };

      const directParent = getParentName("direct-parent");
      const ultimateParent = getParentName("ultimate-parent");

      const formatAddress = (addr: any) => {
        if (!addr) return "N/A";
        const lines = addr.addressLines || [];
        return `${lines.join(", ")}, ${addr.city}, ${addr.country}`;
      };

      const calculateRisk = () => {
        const highRiskCountries = ['AF', 'KP', 'IR', 'SY', 'YE', 'SS', 'MM', 'LY', 'SO'];
        const status = reg.registrationStatus;
        const country = entity.legalAddress?.country;
        
        let statusRisk: "Low" | "Medium" | "High" = "Low";
        if (status === "LAPSED") statusRisk = "Medium";
        if (["RETIRED", "ANNULLED", "CANCELLED", "PENDING_TRANSFER", "PENDING_ARCHIVAL"].includes(status)) statusRisk = "High";

        const countryRisk: "Low" | "Medium" | "High" = highRiskCountries.includes(country) ? "High" : "Low";
        
        // Sanctions risk is a placeholder since we don't have a real sanctions API
        // We flag it as Medium if the entity is unstable or in a high risk country
        let sanctionsRisk: "Low" | "Medium" | "High" = "Low";
        if (statusRisk === "High" || countryRisk === "High") sanctionsRisk = "High";
        else if (statusRisk === "Medium") sanctionsRisk = "Medium";

        let overall: "Low" | "Medium" | "High" = "Low";
        if (statusRisk === "High" || countryRisk === "High" || sanctionsRisk === "High") {
          overall = "High";
        } else if (statusRisk === "Medium" || sanctionsRisk === "Medium") {
          overall = "Medium";
        }

        return {
          entity_status_risk: statusRisk,
          country_risk: countryRisk,
          sanctions_risk: sanctionsRisk,
          overall_score: overall
        };
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

        parents: directParent !== "N/A" ? [directParent] : [],
        ultimate_parent: ultimateParent,

        identifiers: [],
        
        timeline: {
          initial_registration: reg.initialRegistrationDate || "N/A",
          last_update: reg.lastUpdateDate || "N/A",
          next_renewal: reg.nextRenewalDate || "N/A"
        },

        risk: calculateRisk(),

        sanctions_check: ["Manual verification required for high-risk jurisdictions"],

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
