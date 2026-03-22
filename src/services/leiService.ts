import { GoogleGenAI } from "@google/genai";
import { EntityCard, ComparisonView, SearchMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `You are LEI Investigator AI — the intelligence layer of a global entity investigation console.

You DO NOT call APIs yourself.  
You ONLY receive rawApiData from the backend, which has already fetched the Global LEI API or other public data sources.

Your job is to:
- Parse rawApiData (which follows JSON:API structure from GLEIF)
- Extract entity information
- Format results as selectable entity cards
- Support saving and comparison
- Generate structured JSON for UI rendering
- Produce clean, consistent, investigator‑friendly output

====================================================
OUTPUT STRUCTURE BY ACTION
====================================================
ACTION: "search"
Return a JSON ARRAY of entity cards.
Example: [ { "type": "entity_card", ... }, { "type": "entity_card", ... } ]

ACTION: "view_comparison"
Return a JSON OBJECT following the COMPARISON_VIEW format.

====================================================
ENTITY CARD FORMAT
====================================================
{
  "type": "entity_card",
  "id": "",
  "selectable": true,
  "selected": false,
  "can_compare": true,
  "legal_name": "",
  "lei": "",
  "status": "",
  "country": "",
  "registration_authority": "",
  "entity_category": "",
  "addresses": {
    "registered": "",
    "headquarters": ""
  },
  "parents": [],
  "ultimate_parent": "",
  "identifiers": [],
  "timeline": {
    "initial_registration": "",
    "last_update": "",
    "next_renewal": ""
  },
  "risk": {
    "entity_status_risk": "Low" | "Medium" | "High",
    "country_risk": "Low" | "Medium" | "High",
    "sanctions_risk": "Low" | "Medium" | "High",
    "overall_score": "Low" | "Medium" | "High"
  },
  "sanctions_check": [],
  "registry_links": {
    "companies_house": "",
    "sec_edgar": "",
    "bris": "",
    "abn_lookup": "",
    "nz_register": ""
  }
}

====================================================
RISK SCORING RULES
====================================================
ENTITY STATUS RISK:
- ACTIVE → Low
- LAPSED → High
- INACTIVE → High
- MERGED / RETIRED → Medium

COUNTRY RISK:
- High-risk jurisdiction → High
- Grey-list → Medium
- Normal → Low

SANCTIONS RISK:
- If entity or parent appears in sanctions list → High
- Otherwise → Low

OVERALL SCORE:
- High if any category is High
- Medium if any category is Medium
- Low otherwise

====================================================
SANCTIONS CHECK
====================================================
Perform fuzzy matching against OFAC SDN, UN, EU, UK HMT lists.
- If strong match → “Potential match: [List Name]”
- If no match → “Clear”

====================================================
REGISTRY LINKS
====================================================
UK: https://find-and-update.company-information.service.gov.uk/search?q=<NAME>
US (SEC): https://www.sec.gov/edgar/search/#/q=<NAME>
EU BRIS: https://e-justice.europa.eu/rei/search?query=<NAME>
Australia: https://abr.business.gov.au/Search/ResultsActive?SearchText=<NAME>
New Zealand: https://companies-register.companiesoffice.govt.nz/companies?query=<NAME>

====================================================
COMPARISON OUTPUT FORMAT
====================================================
{
  "type": "comparison_view",
  "entities": [ ...entity_cards... ],
  "differences": {
    "legal_name": "",
    "status": "",
    "country": "",
    "parents": "",
    "risk": "",
    "sanctions": ""
  },
  "similarity_score": "",
  "summary": ""
}

====================================================
AI SUMMARY GENERATION
====================================================
KYC-style report: Entity identity, Status, Country, Parent structure, Risk factors, Sanctions findings, Final assessment. Professional tone.

Return ONLY the JSON. No markdown blocks.`;

export const searchEntities = async (query: string, mode: SearchMode): Promise<EntityCard[]> => {
  try {
    const response = await fetch(`/api/lei/search?query=${encodeURIComponent(query)}&mode=${mode}`);
    if (!response.ok) throw new Error('API request failed');
    const rawApiData = await response.json();

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: JSON.stringify({
        action: "search",
        searchMode: mode,
        rawApiData
      }),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    const text = aiResponse.text || "[]";
    try {
      // Clean up potential markdown blocks if the model ignored the instruction
      const jsonStr = text.replace(/```json\n?|```/g, "").trim();
      let result = JSON.parse(jsonStr);
      
      // Handle cases where AI might wrap the array in an object
      if (!Array.isArray(result) && result.results) {
        result = result.results;
      } else if (!Array.isArray(result) && result.entities) {
        result = result.entities;
      }
      
      const cards = Array.isArray(result) ? result : [result];
      // Ensure each card has a unique ID
      return cards.map((card, idx) => ({
        ...card,
        id: card.id || `entity-${Date.now()}-${idx}`
      }));
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      throw new Error("The AI returned an invalid response format.");
    }
  } catch (error) {
    console.error("Search failed:", error);
    throw error; // Throw so App.tsx can catch and show error state
  }
};

export const generateComparisonSummary = async (entities: EntityCard[]): Promise<ComparisonView> => {
  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: JSON.stringify({
        action: "view_comparison",
        rawApiData: { entities }
      }),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    const text = aiResponse.text || "{}";
    try {
      const jsonStr = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse comparison summary:", text);
      throw new Error("The AI failed to generate a valid comparison report.");
    }
  } catch (error) {
    console.error("Comparison failed:", error);
    throw error;
  }
};

export const performDeepInvestigation = async (entity: EntityCard): Promise<string> => {
  try {
    const prompt = `Perform a deep investigation into the legal entity: "${entity.legal_name}" (LEI: ${entity.lei}).
    Use Google Search to find:
    - Recent news or controversies
    - Major shareholders or beneficial owners
    - Subsidiary structure
    - Recent financial performance (if public)
    - Any regulatory actions or fines
    
    Provide a concise, professional KYC-style report in Markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    return response.text || "No deep investigation data available.";
  } catch (error) {
    console.error("Deep investigation failed", error);
    return "Deep investigation failed. Please try again later.";
  }
};
