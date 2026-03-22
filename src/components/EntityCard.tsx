import React from 'react';
import { Shield, Globe, MapPin, Calendar, ExternalLink, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { EntityCard as EntityCardType } from '../types';
import { motion } from 'motion/react';

interface EntityCardProps {
  entity: EntityCardType;
  onToggleSelect: (id: string) => void;
  onDeepInvestigate: (entity: EntityCardType) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onToggleSelect, onDeepInvestigate }) => {
  const riskColors = {
    Low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    Medium: 'text-amber-600 bg-amber-50 border-amber-100',
    High: 'text-rose-600 bg-rose-50 border-rose-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white border rounded-xl shadow-sm transition-all overflow-hidden group ${
        entity.selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-neutral-900 leading-tight">{entity.legal_name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskColors[entity.risk.overall_score]}`}>
                {entity.risk.overall_score} Risk
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {entity.lei}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {entity.country}
              </span>
            </div>
          </div>
          <button
            onClick={() => onToggleSelect(entity.id)}
            className={`flex items-center justify-center w-6 h-6 rounded-full border transition-colors ${
              entity.selected ? 'bg-blue-500 border-blue-500 text-white' : 'border-neutral-300 hover:border-blue-400'
            }`}
          >
            {entity.selected && <CheckCircle2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Addresses
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-neutral-400 font-medium">Registered</p>
                <p className="text-xs text-neutral-600 leading-relaxed">{entity.addresses.registered || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 font-medium">Headquarters</p>
                <p className="text-xs text-neutral-600 leading-relaxed">{entity.addresses.headquarters || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Timeline
            </h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-400">Initial Reg.</span>
                <span className="text-neutral-700">{entity.timeline.initial_registration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Last Update</span>
                <span className="text-neutral-700">{entity.timeline.last_update}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Next Renewal</span>
                <span className="text-neutral-700">{entity.timeline.next_renewal}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Risk Assessment
            </h4>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Status Risk</span>
                <span className={`px-1.5 py-0.5 rounded ${
                  entity.risk.entity_status_risk === 'High' ? 'bg-rose-50 text-rose-600' : 
                  entity.risk.entity_status_risk === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>{entity.risk.entity_status_risk}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Country Risk</span>
                <span className={`px-1.5 py-0.5 rounded ${
                  entity.risk.country_risk === 'High' ? 'bg-rose-50 text-rose-600' : 
                  entity.risk.country_risk === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>{entity.risk.country_risk}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Sanctions Risk</span>
                <span className={`px-1.5 py-0.5 rounded ${
                  entity.risk.sanctions_risk === 'High' ? 'bg-rose-50 text-rose-600' : 
                  entity.risk.sanctions_risk === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>{entity.risk.sanctions_risk}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Sanctions Check
            </h4>
            <div className="space-y-1">
              {entity.sanctions_check.map((check, idx) => (
                <div key={`${check}-${idx}`} className={`text-[11px] px-2 py-1 rounded flex items-center gap-2 ${
                  check.includes('Potential match') ? 'bg-rose-50 text-rose-700 font-medium' : 'bg-neutral-50 text-neutral-600'
                }`}>
                  {check.includes('Potential match') ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {check}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-neutral-100">
          <button
            onClick={() => onDeepInvestigate(entity)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm"
          >
            <Info className="h-3 w-3" />
            Deep Investigate
          </button>
          {Object.entries(entity.registry_links).map(([key, url]) => (
            url && (
              <a
                key={`link-${key}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-50 text-neutral-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-[10px] font-bold uppercase tracking-wider border border-neutral-100"
              >
                {key.replace('_', ' ')}
                <ExternalLink className="h-3 w-3" />
              </a>
            )
          ))}
        </div>
      </div>
    </motion.div>
  );
};
