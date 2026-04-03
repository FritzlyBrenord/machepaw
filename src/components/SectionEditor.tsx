// ============================================
// SECTION EDITOR - Dynamic form based on schema
// ============================================

import { useEffect, useState } from 'react';
import { X, Type, Palette, Layout, Box, Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { normalizeHeaderNavigationSettings } from '@/lib/header-navigation';
import { normalizeSectionProps } from '@/lib/storefront-section-data';
import { useEditorStore } from '@/store/editor-store';
import { sectionRegistry, type Setting } from '@/lib/section-registry';

function setNestedValue(
  target: Record<string, any>,
  path: string[],
  value: any,
): Record<string, any> {
  if (path.length === 0) {
    return target;
  }

  const [head, ...rest] = path;

  if (!head) {
    return target;
  }

  if (rest.length === 0) {
    return {
      ...target,
      [head]: value,
    };
  }

  return {
    ...target,
    [head]: setNestedValue(
      (target[head] as Record<string, any> | undefined) || {},
      rest,
      value,
    ),
  };
}

function getNestedValue(source: Record<string, any>, path: string[]) {
  let current: any = source;
  for (const key of path) {
    current = current?.[key];
  }
  return current;
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function getStructuredStylePath(key: string): string[] | null {
  switch (key) {
    case 'backgroundColor':
      return ['style', 'colors', 'background'];
    case 'textColor':
      return ['style', 'colors', 'text'];
    case 'accentColor':
      return ['style', 'colors', 'accent'];
    case 'fontFamily':
      return ['style', 'typography', 'fontFamily'];
    case 'paddingY':
      return ['style', 'spacing', 'paddingY'];
    case 'gap':
      return ['style', 'spacing', 'gap'];
    case 'textAlign':
      return ['style', 'typography', 'textAlign'];
    case 'containerWidth':
      return ['style', 'spacing', 'container'];
    default:
      return null;
  }
}

function getSettingValue(
  props: Record<string, any>,
  setting: Setting,
  fallbackProps?: Record<string, any>,
) {
  const keys = setting.id.split('.');
  const value = getNestedValue(props, keys);

  if (value !== undefined) {
    return value;
  }

  if (fallbackProps) {
    const fallbackValue = getNestedValue(fallbackProps, keys);
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
  }

  return undefined;
}

function getInputCompatibleValue(setting: Setting, value: any) {
  if (setting.type === 'textarea' && Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object') {
          const label = typeof item.label === 'string' ? item.label : '';
          const href =
            typeof item.href === 'string'
              ? item.href
              : typeof item.link === 'string'
                ? item.link
                : typeof item.url === 'string'
                  ? item.url
                  : '';

          if (label || href) {
            return `${label}|${href}`;
          }
        }

        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  return value;
}

// Setting input component
function SettingInput({
  setting,
  value,
  onChange,
}: {
  setting: Setting;
  value: any;
  onChange: (value: any) => void;
}) {
  const { type, label, placeholder, info, min, max, step, options } = setting;

  switch (type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
          />
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    case 'color':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
            />
          </div>
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Select value={String(value || '')} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center gap-3">
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <div>
            <Label className="text-sm font-medium">{label}</Label>
            {info && <p className="text-xs text-gray-500">{info}</p>}
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="URL de l'image"
            />
          </div>
          {value && (
            <img
              src={value}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg mt-2"
            />
          )}
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    case 'url':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    case 'range':
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">{label}</Label>
            <span className="text-sm text-gray-500">{value || min}</span>
          </div>
          <Slider
            value={[value || min || 0]}
            onValueChange={([v]) => onChange(v)}
            min={min || 0}
            max={max || 100}
            step={step || 1}
          />
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    case 'font':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une police..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
              <SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
              <SelectItem value="'Cormorant Garamond', Georgia, serif">Cormorant Garamond</SelectItem>
              <SelectItem value="'Playfair Display', Georgia, serif">Playfair Display</SelectItem>
            </SelectContent>
          </Select>
          {info && <p className="text-xs text-gray-500">{info}</p>}
        </div>
      );

    default:
      return null;
  }
}

function Accordion({
  title,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</span>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{badge}</span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

export function SectionEditor() {
  const {
    selectedSectionId,
    selectSection,
    updateSectionProps,
    updateSectionStyles,
    updateGlobalSectionProps,
    updateGlobalSectionStyles,
    project,
  } = useEditorStore();

  const selectedPageSection = (() => {
    const currentState = useEditorStore.getState();
    const page = currentState.project.pages.find((p) => p.id === currentState.currentPageId);
    return page?.sections.find((s) => s.id === selectedSectionId);
  })();

  const globalSectionEntries = [
    ['header', project.globalSections?.header],
    ['footer', project.globalSections?.footer],
    ['announcementBar', project.globalSections?.announcementBar],
  ] as const;

  const selectedGlobalEntry = globalSectionEntries.find(
    ([, section]) => section?.id === selectedSectionId
  );

  const globalSectionType = selectedGlobalEntry?.[0];
  const selectedSection = selectedPageSection || selectedGlobalEntry?.[1];
  const [rawPropsDraft, setRawPropsDraft] = useState('{}');
  const [rawPropsError, setRawPropsError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSection) {
      setRawPropsDraft('{}');
      setRawPropsError(null);
      return;
    }

    const normalizedProps = normalizeSectionProps(selectedSection).props;

    const {
      styles: ignoredLegacyStyles,
      style: ignoredStructuredStyle,
      classes: ignoredClasses,
      ...contentOnlyProps
    } = normalizedProps;
    setRawPropsDraft(JSON.stringify(contentOnlyProps, null, 2));
    setRawPropsError(null);
  }, [selectedSection?.id]);

  if (!selectedSection) {
    return (
      <div className="w-80 bg-white border-l h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Éditeur de section</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <Box className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              Sélectionnez une section pour la modifier
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Cliquez sur une section dans le canvas pour éditer son contenu et ses styles
            </p>
          </div>
        </div>
      </div>
    );
  }

  const schema = sectionRegistry.get(selectedSection.type);
  const { props } = selectedSection;
  const normalizedSection = normalizeSectionProps(selectedSection);
  const editableProps = normalizedSection.props;
  const styles = editableProps.styles || {};
  const getSliderNumericValue = (
    value: string | number | undefined,
    fallback: number,
  ) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsedValue = Number.parseFloat(value);
      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }

    return fallback;
  };
  const normalizedNavigationSettings = normalizeHeaderNavigationSettings(
    editableProps.navigationSettings,
  );
  const fallbackProps = {
    ...editableProps,
    content: editableProps.content,
    config: editableProps.config,
    style: editableProps.style,
    classes: editableProps.classes,
    navigationSettings: normalizedNavigationSettings,
  };
  const structuredStyleTypes = new Set([
    'announcementBar',
    'headerModern',
    'headerMinimal',
    'hero',
    'statsBar',
    'categoryGrid',
    'productGrid',
    'editorial',
    'trustBadges',
    'testimonials',
    'newsletter',
    'footerModern',
    'footerMinimal',
  ]);
  const usesStructuredStyle =
    structuredStyleTypes.has(selectedSection.type) || !!props.style;

  const getEditorStyleValue = (key: string, fallback: any) => {
    if (!usesStructuredStyle) {
      return styles[key] ?? fallback;
    }

    const path = getStructuredStylePath(key);
    if (!path) {
      return fallback;
    }

    return getNestedValue(editableProps, path) ?? getNestedValue(fallbackProps, path) ?? fallback;
  };

  const getEditorRootValue = (key: string) => {
    return getNestedValue(editableProps, [key]) ?? getNestedValue(fallbackProps, [key]);
  };

  const handleEditorStyleChange = (key: string, value: any) => {
    if (!usesStructuredStyle) {
      handleStyleChange(key, value);
      return;
    }

    const path = getStructuredStylePath(key);
    if (!path) {
      return;
    }

    handlePropChange(
      path.join('.'),
      key === 'paddingY' || key === 'gap' ? String(value) : value,
    );
  };

  const blockSchemas = (schema?.blocks || []).filter((block) => !!block.itemsPath);
  const getBlockItems = (itemsPath: string) => {
    const items =
      getNestedValue(editableProps, itemsPath.split('.')) ??
      getNestedValue(fallbackProps, itemsPath.split('.'));
    return Array.isArray(items) ? items : [];
  };
  const handleAddBlockItem = (itemsPath: string, settings: Setting[]) => {
    // Build a properly nested object from dotted setting IDs
    // e.g. setting.id "media.src" with default "" → { media: { src: "" } }
    const nextItem = settings.reduce<Record<string, any>>((acc, setting) => {
      const keys = setting.id.split('.');
      if (keys.length === 1) {
        acc[setting.id] = setting.default ?? '';
      } else {
        return setNestedValue(acc, keys, setting.default ?? '');
      }
      return acc;
    }, {});

    handlePropChange(itemsPath, [...getBlockItems(itemsPath), nextItem]);
  };
  const handleRemoveBlockItem = (itemsPath: string, index: number) => {
    handlePropChange(
      itemsPath,
      getBlockItems(itemsPath).filter((_: unknown, itemIndex: number) => itemIndex !== index),
    );
  };

  // Group settings by category
  const contentSettings =
    schema?.settings.filter(
      (s) =>
        !s.id.startsWith('styles.') &&
        !s.id.startsWith('style.') &&
        !s.id.startsWith('classes.'),
    ) || [];
  const navigationMenuKeys = ['menu1', 'menu2', 'menu3', 'menu4', 'menu5', 'menu6'];
  const navigationMenuSettings = navigationMenuKeys.map((menuKey) => ({
    key: menuKey,
    enabled: contentSettings.find((setting) => setting.id === `navigationSettings.${menuKey}.enabled`),
    text: contentSettings.find((setting) => setting.id === `navigationSettings.${menuKey}.text`),
    link: contentSettings.find((setting) => setting.id === `navigationSettings.${menuKey}.link`),
  }));
  const navigationGeneralSettings = contentSettings.filter(
    (setting) =>
      setting.id === 'navigationSettings.showCategories' ||
      setting.id === 'navigationSettings.maxCategories',
  );
  const regularContentSettings = contentSettings.filter(
    (setting) =>
      !setting.id.startsWith('navigationSettings.menu') &&
      !navigationGeneralSettings.some((navSetting) => navSetting.id === setting.id),
  );

  const handlePropChange = (key: string, value: any) => {
    const keys = key.split('.');
    const nextProps =
      keys.length > 1
        ? {
            [keys[0]]: setNestedValue(
              (getEditorRootValue(keys[0]) as Record<string, any>) || {},
              keys.slice(1),
              value,
            ),
          }
        : { [key]: value };

    if (globalSectionType) {
      updateGlobalSectionProps(globalSectionType, nextProps);
    } else {
      updateSectionProps(selectedSection.id, nextProps);
    }
  };

  const handleStyleChange = (styleKey: string, value: any) => {
    const nextStyles = { [styleKey]: value };
    if (globalSectionType) {
      updateGlobalSectionStyles(globalSectionType, nextStyles);
    } else {
      updateSectionStyles(selectedSection.id, nextStyles);
    }
  };

  const handleApplyRawProps = () => {
    try {
      const parsedProps = JSON.parse(rawPropsDraft);

      if (!parsedProps || typeof parsedProps !== 'object' || Array.isArray(parsedProps)) {
        setRawPropsError('Le JSON doit representer un objet de props.');
        return;
      }

      const {
        styles: ignoredLegacyStyles,
        style: ignoredStructuredStyle,
        classes: ignoredClasses,
        ...contentProps
      } = parsedProps as Record<string, any>;

      if (globalSectionType) {
        updateGlobalSectionProps(globalSectionType, contentProps);
      } else {
        updateSectionProps(selectedSection.id, contentProps);
      }

      setRawPropsError(null);
    } catch (error) {
      setRawPropsError(error instanceof Error ? error.message : 'JSON invalide.');
    }
  };



  return (
    <div className="w-80 bg-white border-l h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Éditer la section</h2>
          <p className="text-xs text-gray-500">
            {schema?.name || selectedSection.type}
            {globalSectionType ? ' • Global' : ''}
          </p>
        </div>
        <button
          onClick={() => selectSection(null)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="content" className="rounded-none">
              <Type className="w-4 h-4 mr-1" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="styles" className="rounded-none">
              <Palette className="w-4 h-4 mr-1" />
              Styles
            </TabsTrigger>
            <TabsTrigger value="layout" className="rounded-none">
              <Layout className="w-4 h-4 mr-1" />
              Layout
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="p-4 space-y-4 mt-0">
            {contentSettings.length === 0 ? (
              <>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 text-center py-2">
                  Aucun formulaire dedie n&apos;est disponible pour cette section.
                </p>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Props JSON</Label>
                  <Textarea
                    value={rawPropsDraft}
                    onChange={(event) => setRawPropsDraft(event.target.value)}
                    rows={14}
                    className="font-mono text-xs"
                  />
                  {rawPropsError ? (
                    <p className="text-xs text-red-500">{rawPropsError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Collez ici les props de contenu pour une section scannee automatiquement.
                    </p>
                  )}
                </div>
                <Button onClick={handleApplyRawProps} className="w-full">
                  Appliquer les props JSON
                </Button>
              </div>
              <p className="hidden">
                Aucun paramètre de contenu disponible
              </p>
              </>
            ) : (
              <>
                {navigationMenuSettings.some((menu) => menu.enabled || menu.text || menu.link) && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Liens du menu</h4>
                      <p className="text-xs text-gray-500">
                        Le nom reel du lien et son statut actif sont affiches ici.
                      </p>
                    </div>

                    {navigationMenuSettings.map((menu, index) => {
                      const enabledSetting = menu.enabled;
                      const textSetting = menu.text;
                      const linkSetting = menu.link;
                      const currentText = String(
                        getNestedValue(fallbackProps, ['navigationSettings', menu.key, 'text']) || '',
                      ).trim();
                      const isEnabled = !!getNestedValue(fallbackProps, [
                        'navigationSettings',
                        menu.key,
                        'enabled',
                      ]);
                      const title = currentText || `Lien ${index + 1}`;

                      return (
                        <div key={menu.key} className="space-y-3 rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{title}</p>
                              <p className="text-xs text-gray-500">
                                {isEnabled ? 'Deja affiche dans le header' : 'Pas encore affiche'}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                                isEnabled
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {isEnabled ? 'Actif' : 'Inactif'}
                            </span>
                          </div>

                          {enabledSetting && (
                            <SettingInput
                              setting={{ ...enabledSetting, label: 'Afficher ce lien' }}
                              value={getSettingValue(editableProps, enabledSetting, fallbackProps)}
                              onChange={(v) => handlePropChange(enabledSetting.id, v)}
                            />
                          )}

                          {textSetting && (
                            <SettingInput
                              setting={{ ...textSetting, label: 'Nom du lien' }}
                              value={getSettingValue(editableProps, textSetting, fallbackProps)}
                              onChange={(v) => handlePropChange(textSetting.id, v)}
                            />
                          )}

                          {linkSetting && (
                            <SettingInput
                              setting={{ ...linkSetting, label: 'URL du lien' }}
                              value={getSettingValue(editableProps, linkSetting, fallbackProps)}
                              onChange={(v) => handlePropChange(linkSetting.id, v)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {navigationGeneralSettings.length > 0 && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">Categories vendeur</h4>
                    {navigationGeneralSettings.map((setting) => (
                      <SettingInput
                        key={setting.id}
                        setting={{
                          ...setting,
                          label:
                            setting.id === 'navigationSettings.showCategories'
                              ? 'Afficher les categories du vendeur'
                              : 'Combien de categories afficher',
                        }}
                        value={getSettingValue(editableProps, setting, fallbackProps)}
                        onChange={(v) => handlePropChange(setting.id, v)}
                      />
                    ))}
                  </div>
                )}

                {regularContentSettings.length > 0 && (
                  <div className="space-y-4 border-t pt-4">
                    {regularContentSettings.map((setting) => (
                      <SettingInput
                        key={setting.id}
                        setting={setting}
                        value={getInputCompatibleValue(
                          setting,
                          getSettingValue(editableProps, setting, fallbackProps),
                        )}
                        onChange={(v) => handlePropChange(setting.id, v)}
                      />
                    ))}
                  </div>
                )}

                {blockSchemas.length > 0 && (
                  <div className="space-y-4 border-t pt-4">
                    {blockSchemas.map((block) => {
                      const items = getBlockItems(block.itemsPath!);
                      const reachedMax =
                        typeof schema?.maxBlocks === 'number' &&
                        items.length >= schema.maxBlocks;

                      return (
                        <div key={`${selectedSection.type}-${block.type}`} className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700">{block.name}</h4>
                              <p className="text-xs text-gray-500">
                                {items.length} élément{items.length > 1 ? 's' : ''}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBlockItem(block.itemsPath!, block.settings)}
                              disabled={reachedMax}
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Ajouter
                            </Button>
                          </div>

                          {items.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-3 text-xs text-gray-500">
                              Aucun élément ajouté pour cette section.
                            </div>
                          ) : (
                            items.map((item, index) => {
                              const itemLabel =
                                item?.name ||
                                item?.title ||
                                item?.label ||
                                item?.id ||
                                `${block.name} ${index + 1}`;

                              return (
                                <div key={`${block.type}-${index}`} className="space-y-3 rounded-lg border p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{itemLabel}</p>
                                      <p className="text-xs text-gray-500">Élément {index + 1}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveBlockItem(block.itemsPath!, index)}
                                      className="rounded-md p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                      aria-label={`Supprimer ${itemLabel}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {block.settings.map((setting) => (
                                    <SettingInput
                                      key={`${block.type}-${index}-${setting.id}`}
                                      setting={setting}
                                      value={getInputCompatibleValue(
                                        setting,
                                        getNestedValue(
                                          (item as Record<string, any>) || {},
                                          setting.id.split('.'),
                                        ),
                                      )}
                                      onChange={(value) => {
                                        const nextItems = [...getBlockItems(block.itemsPath!)];
                                        nextItems[index] = setNestedValue(
                                          (nextItems[index] as Record<string, any>) || {},
                                          setting.id.split('.'),
                                          value,
                                        );
                                        handlePropChange(block.itemsPath!, nextItems);
                                      }}
                                    />
                                  ))}
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles" className="p-4 space-y-4 mt-0">
            {/* Colors */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Couleurs</h4>
              
              <div className="space-y-2">
                <Label className="text-sm">Couleur de fond</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={isHexColor(getEditorStyleValue('backgroundColor', '#ffffff')) ? getEditorStyleValue('backgroundColor', '#ffffff') : '#ffffff'}
                    onChange={(e) => handleEditorStyleChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={String(getEditorStyleValue('backgroundColor', ''))}
                    onChange={(e) => handleEditorStyleChange('backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Couleur du texte</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={isHexColor(getEditorStyleValue('textColor', '#000000')) ? getEditorStyleValue('textColor', '#000000') : '#000000'}
                    onChange={(e) => handleEditorStyleChange('textColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={String(getEditorStyleValue('textColor', ''))}
                    onChange={(e) => handleEditorStyleChange('textColor', e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Couleur d&apos;accent</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={isHexColor(getEditorStyleValue('accentColor', project.settings.primaryColor)) ? getEditorStyleValue('accentColor', project.settings.primaryColor) : project.settings.primaryColor}
                    onChange={(e) => handleEditorStyleChange('accentColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={String(getEditorStyleValue('accentColor', ''))}
                    onChange={(e) => handleEditorStyleChange('accentColor', e.target.value)}
                    placeholder={project.settings.primaryColor}
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700">Typographie</h4>
              
              <div className="space-y-2">
                <Label className="text-sm">Police</Label>
                <Select
                  value={String(getEditorStyleValue('fontFamily', project.settings.fontFamily))}
                  onValueChange={(v) => handleEditorStyleChange('fontFamily', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une police" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                    <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                    <SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
                    <SelectItem value="'Cormorant Garamond', Georgia, serif">Cormorant Garamond</SelectItem>
                    <SelectItem value="'Playfair Display', Georgia, serif">Playfair Display</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!usesStructuredStyle && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Taille de police</Label>
                    <span className="text-sm text-gray-500">{getSliderNumericValue(styles.fontSize, 16)}px</span>
                  </div>
                  <Slider
                    value={[getSliderNumericValue(styles.fontSize, 16)]}
                    onValueChange={([v]) => handleStyleChange('fontSize', v)}
                    min={12}
                    max={32}
                    step={1}
                  />
                </div>
              )}
            </div>

            {/* Border */}
            {!usesStructuredStyle && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700">Bordure</h4>
              
              <div className="space-y-2">
                <Label className="text-sm">Couleur de bordure</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={styles.borderColor || '#e5e5e5'}
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={styles.borderColor || ''}
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    placeholder="#e5e5e5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Épaisseur</Label>
                  <span className="text-sm text-gray-500">{getSliderNumericValue(styles.borderWidth, 0)}px</span>
                </div>
                <Slider
                  value={[getSliderNumericValue(styles.borderWidth, 0)]}
                  onValueChange={([v]) => handleStyleChange('borderWidth', v)}
                  min={0}
                  max={10}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Arrondi</Label>
                  <span className="text-sm text-gray-500">{getSliderNumericValue(styles.borderRadius, 8)}px</span>
                </div>
                <Slider
                  value={[getSliderNumericValue(styles.borderRadius, 8)]}
                  onValueChange={([v]) => handleStyleChange('borderRadius', v)}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
            </div>
            )}
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="p-4 space-y-4 mt-0">
            {/* Spacing */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Espacement</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Padding vertical</Label>
                  <span className="text-sm text-gray-500">
                    {usesStructuredStyle
                      ? getSliderNumericValue(getEditorStyleValue('paddingY', '16'), 16)
                      : getSliderNumericValue(styles.paddingY, 60)}
                    {usesStructuredStyle ? '' : 'px'}
                  </span>
                </div>
                <Slider
                  value={[
                    usesStructuredStyle
                      ? getSliderNumericValue(getEditorStyleValue('paddingY', '16'), 16)
                      : getSliderNumericValue(styles.paddingY, 60),
                  ]}
                  onValueChange={([v]) => handleEditorStyleChange('paddingY', v)}
                  min={0}
                  max={usesStructuredStyle ? 40 : 200}
                  step={usesStructuredStyle ? 2 : 4}
                />
              </div>

              {usesStructuredStyle ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Espacement entre cartes</Label>
                    <span className="text-sm text-gray-500">
                      {getSliderNumericValue(getEditorStyleValue('gap', '6'), 6)}
                    </span>
                  </div>
                  <Slider
                    value={[getSliderNumericValue(getEditorStyleValue('gap', '6'), 6)]}
                    onValueChange={([v]) => handleEditorStyleChange('gap', v)}
                    min={0}
                    max={12}
                    step={2}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Padding horizontal</Label>
                      <span className="text-sm text-gray-500">{getSliderNumericValue(styles.paddingX, 24)}px</span>
                    </div>
                    <Slider
                      value={[getSliderNumericValue(styles.paddingX, 24)]}
                      onValueChange={([v]) => handleStyleChange('paddingX', v)}
                      min={0}
                      max={100}
                      step={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Marge vertical</Label>
                      <span className="text-sm text-gray-500">{getSliderNumericValue(styles.marginY, 0)}px</span>
                    </div>
                    <Slider
                      value={[getSliderNumericValue(styles.marginY, 0)]}
                      onValueChange={([v]) => handleStyleChange('marginY', v)}
                      min={0}
                      max={100}
                      step={4}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Alignment */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700">Alignement</h4>
              
              <div className="space-y-2">
                <Label className="text-sm">Alignement du texte</Label>
                <Select
                  value={String(getEditorStyleValue('textAlign', 'left'))}
                  onValueChange={(v) => handleEditorStyleChange('textAlign', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir l'alignement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Gauche</SelectItem>
                    <SelectItem value="center">Centre</SelectItem>
                    <SelectItem value="right">Droite</SelectItem>
                    <SelectItem value="justify">Justifié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Largeur du conteneur</Label>
                <Select
                  value={String(getEditorStyleValue('containerWidth', usesStructuredStyle ? 'contained' : 'container'))}
                  onValueChange={(v) => handleEditorStyleChange('containerWidth', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir la largeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Pleine largeur</SelectItem>
                    <SelectItem value={usesStructuredStyle ? 'contained' : 'container'}>
                      Conteneur (1280px)
                    </SelectItem>
                    <SelectItem value="narrow">Étroit (768px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
