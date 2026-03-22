import React from 'react';
import { Shield, Globe, MapPin, Calendar, ExternalLink, AlertTriangle, CheckCircle2, Cpu, Terminal } from 'lucide-react';
import { EntityCard as EntityCardType } from '../types';
import { motion } from 'motion/react';

interface EntityCardProps {
  entity: EntityCardType;
  onToggleSelect: (id: string) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onToggleSelect }) => {
  const isIssued = entity.status === 'ISSUED';

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`relative hacker-panel transition-all group ${
        entity.selected ? 'border-hacker-blue shadow-[0_0_20px_rgba(0,242,255,0.3)]' : 'border-hacker-blue/30 hover:border-hacker-blue/60'
      }`}
    >
      {/* Glitch Overlay Effect */}
      <div className="absolute inset-0 bg-hacker-blue/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
      
      <div className="p-6">
        <div className="flex justify-between items-start gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-2xl font-hacker hacker-glow uppercase tracking-tight leading-none">{entity.legal_name}</h3>
              <div className={`px-3 py-1 font-hacker text-sm uppercase tracking-widest border-2 ${
                isIssued ? 'border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-rose-500 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
              }`}>
                {entity.status}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[10px] text-hacker-blue/40 font-mono uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                ID: {entity.lei}
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                LOC: {entity.country}
              </span>
              <span className="flex items-center gap-2">
                <Cpu className="h-3 w-3" />
                CAT: {entity.entity_category}
              </span>
            </div>
          </div>
          <button
            onClick={() => onToggleSelect(entity.id)}
            className={`flex items-center justify-center w-8 h-8 border-2 transition-all ${
              entity.selected ? 'bg-hacker-blue border-hacker-blue text-hacker-bg shadow-[0_0_15px_rgba(0,242,255,0.8)]' : 'border-hacker-blue/30 hover:border-hacker-blue text-hacker-blue'
            }`}
          >
            {entity.selected ? <CheckCircle2 className="h-5 w-5" /> : <Terminal className="h-4 w-4 opacity-30" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-y border-hacker-blue/10 py-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-hacker text-hacker-blue/60 uppercase tracking-[0.3em] flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              GEO_COORDINATES
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-hacker-blue/30 font-mono uppercase mb-1">REG_OFFICE</p>
                <p className="text-xs text-hacker-blue/80 leading-relaxed font-mono">{entity.addresses.registered || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[9px] text-hacker-blue/30 font-mono uppercase mb-1">HQ_BASE</p>
                <p className="text-xs text-hacker-blue/80 leading-relaxed font-mono">{entity.addresses.headquarters || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-hacker text-hacker-blue/60 uppercase tracking-[0.3em] flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              TEMPORAL_LOGS
            </h4>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex justify-between border-b border-hacker-blue/5 pb-1">
                <span className="text-hacker-blue/30">INIT_BOOT</span>
                <span className="text-hacker-blue/90">{entity.timeline.initial_registration}</span>
              </div>
              <div className="flex justify-between border-b border-hacker-blue/5 pb-1">
                <span className="text-hacker-blue/30">LAST_SYNC</span>
                <span className="text-hacker-blue/90">{entity.timeline.last_update}</span>
              </div>
              <div className="flex justify-between border-b border-hacker-blue/5 pb-1">
                <span className="text-hacker-blue/30">NEXT_RENEW</span>
                <span className="text-hacker-blue/90">{entity.timeline.next_renewal}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-hacker text-hacker-blue/60 uppercase tracking-[0.3em] flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              SYSTEM_METRICS
            </h4>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex justify-between items-center border-b border-hacker-blue/5 pb-1">
                <span className="text-hacker-blue/30">REG_AUTH</span>
                <span className="text-hacker-blue/90 truncate max-w-[120px]">{entity.registration_authority}</span>
              </div>
              <div className="flex justify-between items-center border-b border-hacker-blue/5 pb-1">
                <span className="text-hacker-blue/30">ENTITY_TYPE</span>
                <span className="text-hacker-blue/90">{entity.entity_category}</span>
              </div>
              <div className="flex justify-between items-center border-b border-hacker-blue/5 pb-1">
                <span className="text-hacker-blue/30">INTEGRITY</span>
                <span className={isIssued ? 'text-emerald-500' : 'text-rose-500'}>
                  {isIssued ? 'VERIFIED' : 'UNSTABLE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[9px] font-hacker text-hacker-blue/30 uppercase tracking-widest mr-2">EXTERNAL_UPLINKS:</span>
          {Object.entries(entity.registry_links).map(([key, url]) => (
            url && (
              <a
                key={`link-${key}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 px-3 py-1.5 border border-hacker-blue/20 text-hacker-blue/60 hover:border-hacker-blue hover:text-hacker-blue hover:bg-hacker-blue/5 transition-all text-[9px] font-mono uppercase tracking-tighter"
              >
                {key.replace('_', ' ')}
                <ExternalLink className="h-2.5 w-2.5 opacity-50 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            )
          ))}
        </div>
      </div>
    </motion.div>
  );
};
