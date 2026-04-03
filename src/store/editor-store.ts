// ============================================
// EDITOR STORE - Complete state management
// Inspired by Shopify Theme Editor
// ============================================

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type {
  Project,
  Page,
  Section,
  EditorStore,
  Template,
  SectionPropsMap,
} from '@/types/builder-types';
import { sectionRegistry, type Setting } from '@/lib/section-registry';
import { getDefaultSectionProps } from '@/lib/section-defaults';
import { ensureProjectHasSystemPages } from '@/lib/project-system-pages';
import { normalizeProjectSections } from '@/lib/storefront-section-data';
import { fashionBoutiqueTemplate } from '@/lib/templates';

// --- Initial State ---

const createInitialProject = (): Project => {
  const template = fashionBoutiqueTemplate;
  return normalizeProjectSections(
    ensureProjectHasSystemPages({
      ...template.project,
      id: `project-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure globalSections is always initialized
      globalSections: template.project.globalSections || {
        header: undefined,
        footer: undefined,
        announcementBar: undefined,
      },
    }),
  );
};

// --- History Management ---

const MAX_HISTORY_SIZE = 50;

interface HistoryState {
  history: Project[];
  historyIndex: number;
}

function cloneSectionProps<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function applySchemaSettingDefaults(
  target: SectionPropsMap,
  settings: Setting[],
) {
  settings.forEach((setting) => {
    const keys = setting.id.split('.');
    let current: SectionPropsMap = target;

    for (let index = 0; index < keys.length - 1; index += 1) {
      const key = keys[index];
      const nextValue = current[key];

      if (
        typeof nextValue !== 'object' ||
        nextValue === null ||
        Array.isArray(nextValue)
      ) {
        current[key] = {};
      }

      current = current[key] as SectionPropsMap;
    }

    const lastKey = keys[keys.length - 1];

    if (current[lastKey] === undefined) {
      current[lastKey] = setting.default;
    }
  });
}

// --- Store Implementation ---

export const useEditorStore = create<EditorStore & HistoryState>()(
  immer((set, get) => ({
    // --- State ---
    project: createInitialProject(),
    currentPageId: '',
    selectedSectionId: null,
    isPreview: false,
    devicePreview: 'desktop',
    history: [createInitialProject()],
    historyIndex: 0,

    // --- Initialization ---
    init: () => {
      const project = createInitialProject();
      set((state) => {
        state.project = project;
        state.currentPageId = project.pages[0]?.id || '';
        state.history = [project];
        state.historyIndex = 0;
      });
    },

    // --- Project Actions ---
    setProject: (project) => {
      const normalizedProject = normalizeProjectSections(
        ensureProjectHasSystemPages(project),
      );
      set((state) => {
        state.project = normalizedProject;
        state.currentPageId = normalizedProject.pages[0]?.id || '';
        state.selectedSectionId = null;
      });
      get().saveToHistory();
    },

    loadTemplate: (template: Template) => {
      const newProject = normalizeProjectSections(
        ensureProjectHasSystemPages({
          ...template.project,
          id: `project-${uuidv4()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Ensure globalSections is always initialized
          globalSections: template.project.globalSections || {
            header: undefined,
            footer: undefined,
            announcementBar: undefined,
          },
        }),
      );
      set((state) => {
        state.project = newProject;
        state.currentPageId = newProject.pages[0]?.id || '';
        state.selectedSectionId = null;
      });
      get().saveToHistory();
    },

    updateProjectSettings: (settings) => {
      set((state) => {
        Object.assign(state.project.settings, settings);
        state.project.updatedAt = new Date().toISOString();
      });
      get().saveToHistory();
    },

    exportProject: () => {
      return JSON.stringify(get().project, null, 2);
    },

    importProject: (json: string) => {
      try {
        const project = JSON.parse(json) as Project;
        get().setProject(project);
        return true;
      } catch {
        return false;
      }
    },

    // --- Page Actions ---
    setCurrentPage: (pageId) => {
      set((state) => {
        state.currentPageId = pageId;
        state.selectedSectionId = null;
      });
    },

    addPage: (page) => {
      set((state) => {
        state.project.pages.push(page);
        state.project.updatedAt = new Date().toISOString();
      });
      get().saveToHistory();
    },

    updatePage: (pageId, updates) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === pageId);
        if (page) {
          Object.assign(page, updates);
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    deletePage: (pageId) => {
      set((state) => {
        const pageIndex = state.project.pages.findIndex((p) => p.id === pageId);
        if (pageIndex > -1 && state.project.pages.length > 1) {
          state.project.pages.splice(pageIndex, 1);
          if (state.currentPageId === pageId) {
            state.currentPageId = state.project.pages[0]?.id || '';
          }
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    duplicatePage: (pageId) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === pageId);
        if (page) {
          const newPage = {
            ...JSON.parse(JSON.stringify(page)),
            id: `page-${uuidv4()}`,
            name: `${page.name} (copie)`,
            slug: `${page.slug}-copie`,
            isHome: false,
            sections: page.sections.map((s) => ({
              ...JSON.parse(JSON.stringify(s)),
              id: `sect-${uuidv4()}`,
            })),
          };
          state.project.pages.push(newPage);
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    // --- Section Actions ---
    addSection: (type, insertIndex) => {
      const schema = sectionRegistry.get(type);
      if (!schema) return;

      set((state) => {
        const page = state.project.pages.find((p) => p.id === state.currentPageId);
        if (!page) return;

        const defaultProps: SectionPropsMap = schema.defaults
          ? cloneSectionProps(schema.defaults as SectionPropsMap)
          : cloneSectionProps(getDefaultSectionProps(type) as SectionPropsMap);

        applySchemaSettingDefaults(defaultProps, schema.settings);

        // Add presets
        if (schema.presets) {
          Object.assign(defaultProps, schema.presets);
        }

        const newSection: Section = {
          id: `sect-${uuidv4()}`,
          type,
          order: insertIndex ?? page.sections.length,
          props: defaultProps,
          visible: true,
        };

        if (insertIndex !== undefined) {
          page.sections.splice(insertIndex, 0, newSection);
          page.sections.forEach((s, i) => { s.order = i; });
        } else {
          page.sections.push(newSection);
        }

        state.selectedSectionId = newSection.id;
        state.project.updatedAt = new Date().toISOString();
      });
      get().saveToHistory();
    },

    updateSection: (sectionId, updates) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === state.currentPageId);
        if (!page) return;

        const section = page.sections.find((s) => s.id === sectionId);
        if (section) {
          Object.assign(section, updates);
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    updateSectionProps: (sectionId, props) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === state.currentPageId);
        if (!page) return;

        const section = page.sections.find((s) => s.id === sectionId);
        if (section) {
          Object.assign(section.props, props);
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    updateSectionStyles: (sectionId, styles) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === state.currentPageId);
        if (!page) return;

        const section = page.sections.find((s) => s.id === sectionId);
        if (section) {
          if (!section.props.styles) section.props.styles = {};
          Object.assign(section.props.styles, styles);
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    deleteSection: (sectionId) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === state.currentPageId);
        if (!page) return;

        const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
        if (sectionIndex > -1) {
          page.sections.splice(sectionIndex, 1);
          page.sections.forEach((s, i) => { s.order = i; });
          
          if (state.selectedSectionId === sectionId) {
            state.selectedSectionId = null;
          }
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    duplicateSection: (sectionId) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === state.currentPageId);
        if (!page) return;

        const section = page.sections.find((s) => s.id === sectionId);
        if (section) {
          const sectionIndex = page.sections.indexOf(section);
          const newSection: Section = {
            ...JSON.parse(JSON.stringify(section)),
            id: `sect-${uuidv4()}`,
            order: sectionIndex + 1,
          };
          page.sections.splice(sectionIndex + 1, 0, newSection);
          page.sections.forEach((s, i) => { s.order = i; });
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    moveSection: (fromIndex, toIndex) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === state.currentPageId);
        if (!page) return;

        const [movedSection] = page.sections.splice(fromIndex, 1);
        page.sections.splice(toIndex, 0, movedSection);
        page.sections.forEach((s, i) => { s.order = i; });
        state.project.updatedAt = new Date().toISOString();
      });
      get().saveToHistory();
    },

    toggleSectionVisibility: (sectionId) => {
      set((state) => {
        const page = state.project.pages.find((p) => p.id === state.currentPageId);
        if (!page) return;

        const section = page.sections.find((s) => s.id === sectionId);
        if (section) {
          section.visible = !section.visible;
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    selectSection: (sectionId) => {
      set((state) => {
        state.selectedSectionId = sectionId;
      });
    },

    // --- Global Sections Actions ---
    setGlobalSection: (type, section) => {
      set((state) => {
        if (!state.project.globalSections) {
          state.project.globalSections = {};
        }
        state.project.globalSections[type] = section;
        state.project.updatedAt = new Date().toISOString();
      });
      get().saveToHistory();
    },

    updateGlobalSectionProps: (type, props) => {
      set((state) => {
        if (!state.project.globalSections) {
          state.project.globalSections = {};
        }
        const section = state.project.globalSections[type];
        if (section) {
          Object.assign(section.props, props);
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    updateGlobalSectionStyles: (type, styles) => {
      set((state) => {
        if (!state.project.globalSections) {
          state.project.globalSections = {};
        }
        const section = state.project.globalSections[type];
        if (section) {
          if (!section.props.styles) section.props.styles = {};
          Object.assign(section.props.styles, styles);
          state.project.updatedAt = new Date().toISOString();
        }
      });
      get().saveToHistory();
    },

    // --- History Actions ---
    saveToHistory: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }

        state.history.push(JSON.parse(JSON.stringify(state.project)));

        if (state.history.length > MAX_HISTORY_SIZE) {
          state.history.shift();
        } else {
          state.historyIndex++;
        }
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          state.project = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
          state.selectedSectionId = null;
        }
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          state.project = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
          state.selectedSectionId = null;
        }
      });
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // --- Preview Actions ---
    togglePreview: () => {
      set((state) => {
        state.isPreview = !state.isPreview;
        state.selectedSectionId = null;
      });
    },

    setPreview: (isPreview) => {
      set((state) => {
        state.isPreview = isPreview;
        if (isPreview) {
          state.selectedSectionId = null;
        }
      });
    },

    setDevicePreview: (device) => {
      set((state) => {
        state.devicePreview = device;
      });
    },
  }))
);

// --- Selectors ---

export const selectCurrentPage = (state: ReturnType<typeof useEditorStore.getState>): Page | undefined => {
  return state.project.pages.find((p) => p.id === state.currentPageId);
};

export const selectSelectedSection = (state: ReturnType<typeof useEditorStore.getState>): Section | undefined => {
  const page = selectCurrentPage(state);
  if (!page) return undefined;
  return page.sections.find((s) => s.id === state.selectedSectionId);
};

export const selectSections = (state: ReturnType<typeof useEditorStore.getState>): Section[] => {
  const page = selectCurrentPage(state);
  return page?.sections || [];
};

export const selectHeaders = (state: ReturnType<typeof useEditorStore.getState>): Section[] => {
  const page = selectCurrentPage(state);
  return page?.sections.filter((s) => s.type === 'headerModern' || s.type === 'headerMinimal') || [];
};

export const selectFooters = (state: ReturnType<typeof useEditorStore.getState>): Section[] => {
  const page = selectCurrentPage(state);
  return page?.sections.filter((s) => s.type === 'footerModern' || s.type === 'footerMinimal') || [];
};

export const selectGlobalHeader = (state: ReturnType<typeof useEditorStore.getState>): Section | undefined => {
  return state.project.globalSections?.header;
};

export const selectGlobalFooter = (state: ReturnType<typeof useEditorStore.getState>): Section | undefined => {
  return state.project.globalSections?.footer;
};

export const selectGlobalAnnouncementBar = (state: ReturnType<typeof useEditorStore.getState>): Section | undefined => {
  return state.project.globalSections?.announcementBar;
};
