// ============================================
// TEMPLATE SELECTOR - Choose from pre-built templates
// ============================================

import { useState } from 'react';
import { Check, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { templates, templateCategories, getTemplatesByCategory } from '@/lib/templates';
import { useEditorStore } from '@/store/editor-store';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateSelector({ isOpen, onClose }: TemplateSelectorProps) {
  const { loadTemplate } = useEditorStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [, setPreviewTemplate] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      loadTemplate(template);
      onClose();
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Choisir un template</DialogTitle>
              <p className="text-sm text-gray-500">
                Sélectionnez un template pré-construit pour démarrer votre boutique
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-6 mt-4 justify-start">
            <TabsTrigger value="all">Tous</TabsTrigger>
            {templateCategories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            {/* All Templates */}
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    onSelect={() => setSelectedTemplateId(template.id)}
                    onPreview={() => setPreviewTemplate(template.id)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Category Tabs */}
            {templateCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getTemplatesByCategory(category.id).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplateId === template.id}
                      onSelect={() => setSelectedTemplateId(template.id)}
                      onPreview={() => setPreviewTemplate(template.id)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between bg-gray-50">
          <div>
            {selectedTemplate && (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">{selectedTemplate.name}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              onClick={() => selectedTemplateId && handleSelectTemplate(selectedTemplateId)}
              disabled={!selectedTemplateId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Utiliser ce template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateCardProps {
  template: typeof templates[0];
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 ring-4 ring-blue-100'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            Aperçu
          </Button>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
        
        {/* Color scheme preview */}
        <div className="flex gap-2 mt-3">
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: template.colorScheme.primary }}
            title="Primaire"
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: template.colorScheme.accent }}
            title="Accent"
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: template.colorScheme.background }}
            title="Fond"
          />
        </div>
      </div>
    </div>
  );
}
