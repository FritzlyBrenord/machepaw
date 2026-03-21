import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CategoryWithAttributes, CategoryAttribute } from '@/data/types';

const CATEGORIES_QUERY_KEY = 'categories';

// ==========================================
// FETCH CATEGORIES WITH ATTRIBUTES
// ==========================================

export const useCategories = () => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as CategoryWithAttributes[];
    },
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, id],
    queryFn: async () => {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (categoryError) throw categoryError;

      const { data: attributes, error: attributesError } = await supabase
        .from('category_attributes')
        .select('*')
        .eq('category_id', id)
        .order('sort_order', { ascending: true });

      if (attributesError) throw attributesError;

      return {
        ...category,
        attributes: attributes || [],
      } as CategoryWithAttributes;
    },
    enabled: !!id,
  });
};

// ==========================================
// CREATE CATEGORY
// ==========================================

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  attributes: Omit<CategoryAttribute, 'id' | 'categoryId'>[];
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      // Create category first
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .insert([
          {
            name: data.name,
            slug: data.slug,
            description: data.description,
            image: data.image,
            parent_id: data.parentId,
            is_active: true,
            product_count: 0,
          },
        ])
        .select()
        .single();

      if (categoryError) throw categoryError;

      // Create attributes if any
      if (data.attributes.length > 0) {
        const attributesData = data.attributes.map((attr, index) => ({
          category_id: category.id,
          name: attr.name,
          label: attr.label,
          type: attr.type,
          options: attr.options,
          required: attr.required,
          sort_order: index,
        }));

        const { error: attributesError } = await supabase
          .from('category_attributes')
          .insert(attributesData);

        if (attributesError) throw attributesError;
      }

      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
};

// ==========================================
// UPDATE CATEGORY ATTRIBUTES
// ==========================================

interface UpdateCategoryAttributesData {
  categoryId: string;
  attributes: CategoryAttribute[];
}

export const useUpdateCategoryAttributes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, attributes }: UpdateCategoryAttributesData) => {
      // Delete existing attributes
      const { error: deleteError } = await supabase
        .from('category_attributes')
        .delete()
        .eq('category_id', categoryId);

      if (deleteError) throw deleteError;

      // Insert new attributes
      if (attributes.length > 0) {
        const attributesData = attributes.map((attr, index) => ({
          category_id: categoryId,
          name: attr.name,
          label: attr.label,
          type: attr.type,
          options: attr.options,
          required: attr.required,
          sort_order: index,
        }));

        const { error: insertError } = await supabase
          .from('category_attributes')
          .insert(attributesData);

        if (insertError) throw insertError;
      }

      return { categoryId, attributes };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, data.categoryId] });
    },
  });
};

// ==========================================
// GET DEFAULT ATTRIBUTES BY CATEGORY TYPE
// ==========================================

export const getDefaultAttributesForCategory = (
  categoryType: 'clothing' | 'electronics' | 'jewelry' | 'bags' | 'watches' | 'beauty' | 'home' | 'default'
): Omit<CategoryAttribute, 'id' | 'categoryId'>[] => {
  const defaults: Record<string, Omit<CategoryAttribute, 'id' | 'categoryId'>[]> = {
    clothing: [
      { name: 'color', label: 'Couleur', type: 'color', required: true, sortOrder: 0, options: ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Gris', 'Marron', 'Beige'] },
      { name: 'size', label: 'Taille', type: 'select', required: true, sortOrder: 1, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      { name: 'material', label: 'Matière', type: 'select', required: false, sortOrder: 2, options: ['Coton', 'Polyester', 'Laine', 'Soie', 'Lin', 'Cuir', 'Jean'] },
      { name: 'care', label: 'Entretien', type: 'multiselect', required: false, sortOrder: 3, options: ['Lavage 30°C', 'Lavage main', 'Nettoyage à sec', 'Repassage interdit', 'Sèche-linge interdit'] },
    ],
    electronics: [
      { name: 'brand', label: 'Marque', type: 'text', required: true, sortOrder: 0 },
      { name: 'model', label: 'Modèle', type: 'text', required: true, sortOrder: 1 },
      { name: 'warranty', label: 'Garantie (mois)', type: 'number', required: false, sortOrder: 2 },
      { name: 'condition', label: 'État', type: 'select', required: true, sortOrder: 3, options: ['Neuf', 'Reconditionné', 'Occasion'] },
      { name: 'connectivity', label: 'Connectivité', type: 'multiselect', required: false, sortOrder: 4, options: ['Wi-Fi', 'Bluetooth', 'NFC', 'USB-C', 'HDMI', '5G', '4G'] },
    ],
    jewelry: [
      { name: 'material', label: 'Matériau', type: 'select', required: true, sortOrder: 0, options: ['Or', 'Argent', 'Platine', 'Acier inoxydable', 'Titane', 'Cuivre', 'Laiton'] },
      { name: 'stone', label: 'Pierre précieuse', type: 'select', required: false, sortOrder: 1, options: ['Diamant', 'Rubis', 'Saphir', 'Émeraude', 'Perle', 'Aucune'] },
      { name: 'size', label: 'Taille', type: 'text', required: false, sortOrder: 2 },
      { name: 'purity', label: 'Pureté', type: 'text', required: false, sortOrder: 3 },
      { name: 'weight', label: 'Poids (g)', type: 'number', required: false, sortOrder: 4 },
    ],
    bags: [
      { name: 'color', label: 'Couleur', type: 'color', required: true, sortOrder: 0, options: ['Noir', 'Marron', 'Beige', 'Rouge', 'Bleu', 'Vert', 'Gris', 'Blanc'] },
      { name: 'material', label: 'Matière', type: 'select', required: true, sortOrder: 1, options: ['Cuir', 'Cuir synthétique', 'Toile', 'Nylon', 'Polyester', 'Jean', 'Paille'] },
      { name: 'size', label: 'Format', type: 'select', required: true, sortOrder: 2, options: ['Mini', 'Petit', 'Moyen', 'Grand', 'Extra-large'] },
      { name: 'compartments', label: 'Nombre de compartiments', type: 'number', required: false, sortOrder: 3 },
      { name: 'waterproof', label: 'Imperméable', type: 'boolean', required: false, sortOrder: 4 },
    ],
    watches: [
      { name: 'brand', label: 'Marque', type: 'text', required: true, sortOrder: 0 },
      { name: 'movement', label: 'Mouvement', type: 'select', required: true, sortOrder: 1, options: ['Automatique', 'Quartz', 'Mécanique', 'Solaire', 'Kinetic'] },
      { name: 'case_material', label: 'Matériau boîtier', type: 'select', required: false, sortOrder: 2, options: ['Acier', 'Or', 'Titane', 'Céramique', 'Carbone', 'Plastique'] },
      { name: 'strap_material', label: 'Matériau bracelet', type: 'select', required: false, sortOrder: 3, options: ['Cuir', 'Acier', 'Caoutchouc', 'Silicone', 'Nylon', 'Titane'] },
      { name: 'water_resistance', label: 'Résistance à l\'eau', type: 'text', required: false, sortOrder: 4 },
      { name: 'diameter', label: 'Diamètre (mm)', type: 'number', required: false, sortOrder: 5 },
    ],
    beauty: [
      { name: 'type', label: 'Type de produit', type: 'select', required: true, sortOrder: 0, options: ['Soin visage', 'Soin corps', 'Maquillage', 'Parfum', 'Cheveux', 'Accessoires'] },
      { name: 'skin_type', label: 'Type de peau', type: 'multiselect', required: false, sortOrder: 1, options: ['Normale', 'Sèche', 'Grasse', 'Mixte', 'Sensible', 'Mature'] },
      { name: 'volume', label: 'Volume (ml)', type: 'number', required: false, sortOrder: 2 },
      { name: 'organic', label: 'Bio / Naturel', type: 'boolean', required: false, sortOrder: 3 },
      { name: 'cruelty_free', label: 'Cruelty-free', type: 'boolean', required: false, sortOrder: 4 },
    ],
    home: [
      { name: 'color', label: 'Couleur', type: 'color', required: false, sortOrder: 0, options: ['Blanc', 'Noir', 'Gris', 'Beige', 'Marron', 'Bleu', 'Vert', 'Rouge', 'Jaune'] },
      { name: 'material', label: 'Matériau', type: 'select', required: false, sortOrder: 1, options: ['Bois', 'Métal', 'Plastique', 'Verre', 'Céramique', 'Tissu', 'Pierre', 'Rotin'] },
      { name: 'dimensions', label: 'Dimensions', type: 'text', required: false, sortOrder: 2 },
      { name: 'weight', label: 'Poids (kg)', type: 'number', required: false, sortOrder: 3 },
    ],
    default: [
      { name: 'color', label: 'Couleur', type: 'color', required: false, sortOrder: 0 },
      { name: 'material', label: 'Matériau', type: 'text', required: false, sortOrder: 1 },
      { name: 'dimensions', label: 'Dimensions', type: 'text', required: false, sortOrder: 2 },
      { name: 'weight', label: 'Poids', type: 'number', required: false, sortOrder: 3 },
    ],
  };

  return defaults[categoryType] || defaults.default;
};
