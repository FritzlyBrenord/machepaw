// ============================================
// ADD SECTION MODAL - Add new sections to the page
// ============================================

import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useEditorStore } from '@/store/editor-store';
import {
  getSectionLibraryEntries,
  getSectionLibraryTabs,
  type SectionLibraryEntry,
} from '@/lib/section-library';
import { useMemo, useState } from 'react';
import type { SectionType } from '@/types/builder-types';

interface AddSectionModalProps {
  insertIndex?: number;
}

// Icon components mapping
const iconComponents: Record<string, React.ElementType> = {
  Layout: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  Minus: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Image: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  Megaphone: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  Grid3X3: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  ShoppingBag: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Package: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Tag: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Shield: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  MessageSquare: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Mail: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  LayoutTemplate: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  ),
  ChevronRight: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ShoppingCart: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  CreditCard: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Search: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Timer: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="2" x2="14" y2="2" />
      <line x1="12" y1="14" x2="12" y2="2" />
      <circle cx="12" cy="14" r="10" />
    </svg>
  ),
  Sparkles: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  PanelTop: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
    </svg>
  ),
};

export function AddSectionModal({ insertIndex }: AddSectionModalProps = {}) {
  const { addSection } = useEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddSection = (type: SectionType) => {
    addSection(type, insertIndex);
    setIsOpen(false);
    setSearchQuery('');
  };

  const allSections = useMemo(() => getSectionLibraryEntries(), []);
  const libraryTabs = useMemo(() => getSectionLibraryTabs(allSections), [allSections]);

  const filteredSections = searchQuery
    ? allSections.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.pageGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSections;

  const SectionCard = ({ section }: { section: SectionLibraryEntry }) => {
    const Icon = iconComponents[section.icon || 'Layout'] || iconComponents.Layout;
    return (
      <button
        onClick={() => handleAddSection(section.type)}
        className="flex flex-col items-start p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
      >
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
          <Icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {section.pageGroup} / {section.family}
        </span>
        <span className="mt-1 text-sm font-medium">{section.name}</span>
        {section.description && (
          <span className="text-xs text-gray-500 mt-1 line-clamp-2">{section.description}</span>
        )}
        <span className="mt-3 text-[11px] text-gray-400">{section.sourcePath}</span>
      </button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full py-8 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une section
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Ajouter une section</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {searchQuery ? (
          // Search results
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredSections.map((section) => (
                <SectionCard key={section.type} section={section} />
              ))}
            </div>
            {filteredSections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune section trouvée
              </div>
            )}
          </div>
        ) : (
          <Tabs
            defaultValue={libraryTabs[0]?.key}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="mx-6 mt-4 justify-start flex-wrap h-auto">
              {libraryTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              {libraryTabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key} className="mt-0 space-y-6">
                  {tab.groups.map((group) => (
                    <div key={group.key} className="space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{group.label}</h3>
                        <p className="text-xs text-gray-500">
                          {group.sections.length} section{group.sections.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {group.sections.map((section) => (
                          <SectionCard key={section.type} section={section} />
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
