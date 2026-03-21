import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchCurrentAccount } from "@/hooks/useAccount";

// ======================================================
// TYPES
// ======================================================

export interface Announcement {
  id: string;
  title: string;
  content: string | null;
  type: 'banner' | 'popup' | 'hero_slide' | 'notification_bar';
  placement: 'hero' | 'top_bar' | 'popup' | 'sidebar';
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean;
  show_on_every_visit: boolean;
  display_delay_seconds: number;
  starts_at: string;
  ends_at: string | null;
  background_color: string;
  text_color: string;
  priority: number;
  view_count: number;
  click_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementData {
  title: string;
  content?: string;
  type: Announcement['type'];
  placement: Announcement['placement'];
  image_url?: string;
  link_url?: string;
  link_text?: string;
  is_active?: boolean;
  show_on_every_visit?: boolean;
  display_delay_seconds?: number;
  starts_at?: string;
  ends_at?: string;
  background_color?: string;
  text_color?: string;
  priority?: number;
}

export type UpdateAnnouncementData = Partial<CreateAnnouncementData>;

const ANNOUNCEMENTS_KEY = 'announcements';
const SELLER_ANNOUNCEMENTS_KEY = "seller_announcements";

export const SELLER_WEEKLY_ANNOUNCEMENT_LIMIT = 3;

export const ACTIVE_ANNOUNCEMENT_LIMITS = {
  hero: 5,
  top_bar: 3,
  popup: 20,
  sidebar: 2,
} satisfies Record<Announcement["placement"], number>;

// ======================================================
// HOOKS
// ======================================================

export const useAnnouncements = (placement?: string) => {
  return useQuery({
    queryKey: [ANNOUNCEMENTS_KEY, placement],
    queryFn: async () => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      let query = supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (placement) {
        query = query.eq('placement', placement);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Announcement[];
    },
  });
};

// For storefront: only active, within validity dates
export const useActiveAnnouncements = (placement?: string) => {
  return useQuery({
    queryKey: [ANNOUNCEMENTS_KEY, 'active', placement],
    queryFn: async () => {
      const now = new Date().toISOString();
      const maxItems = placement
        ? ACTIVE_ANNOUNCEMENT_LIMITS[placement as Announcement["placement"]] ?? 4
        : 8;
      let query = supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(maxItems * 4);

      if (placement) {
        query = query.eq('placement', placement);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by ends_at (can be null = no expiry)
      return (data as Announcement[])
        .filter((a) => !a.ends_at || new Date(a.ends_at) > new Date())
        .slice(0, maxItems);
    },
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAnnouncementData) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { data: result, error } = await supabase
        .from('announcements')
        .insert([{
          ...data,
          starts_at: data.starts_at || new Date().toISOString(),
          created_by: account.userId,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAnnouncementData }) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { data: result, error } = await supabase
        .from('announcements')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
    },
  });
};

export const useToggleAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { data: result, error } = await supabase
        .from('announcements')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
    },
  });
};

export const useSellerAnnouncements = (placement?: string) => {
  return useQuery({
    queryKey: [SELLER_ANNOUNCEMENTS_KEY, placement],
    queryFn: async () => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        return [];
      }

      let query = supabase
        .from("announcements")
        .select("*")
        .eq("created_by", account.userId)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (placement) {
        query = query.eq("placement", placement);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Announcement[];
    },
  });
};

export const useCreateSellerAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnnouncementData) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("Approved seller access required");
      }

      const { data: result, error } = await supabase
        .from("announcements")
        .insert([
          {
            ...data,
            starts_at: data.starts_at || new Date().toISOString(),
            created_by: account.userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SELLER_ANNOUNCEMENTS_KEY] });
    },
  });
};

export const useUpdateSellerAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAnnouncementData;
    }) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("Approved seller access required");
      }

      const { data: ownedAnnouncement, error: accessError } = await supabase
        .from("announcements")
        .select("id")
        .eq("id", id)
        .eq("created_by", account.userId)
        .maybeSingle();

      if (accessError) throw accessError;
      if (!ownedAnnouncement) {
        throw new Error("Annonce vendeur introuvable ou non accessible.");
      }

      const { data: result, error } = await supabase
        .from("announcements")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("created_by", account.userId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SELLER_ANNOUNCEMENTS_KEY] });
    },
  });
};

export const useDeleteSellerAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("Approved seller access required");
      }

      const { data: ownedAnnouncement, error: accessError } = await supabase
        .from("announcements")
        .select("id")
        .eq("id", id)
        .eq("created_by", account.userId)
        .maybeSingle();

      if (accessError) throw accessError;
      if (!ownedAnnouncement) {
        throw new Error("Annonce vendeur introuvable ou non accessible.");
      }

      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id)
        .eq("created_by", account.userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SELLER_ANNOUNCEMENTS_KEY] });
    },
  });
};

export const useToggleSellerAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("Approved seller access required");
      }

      const { data: ownedAnnouncement, error: accessError } = await supabase
        .from("announcements")
        .select("id")
        .eq("id", id)
        .eq("created_by", account.userId)
        .maybeSingle();

      if (accessError) throw accessError;
      if (!ownedAnnouncement) {
        throw new Error("Annonce vendeur introuvable ou non accessible.");
      }

      const { data: result, error } = await supabase
        .from("announcements")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("created_by", account.userId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SELLER_ANNOUNCEMENTS_KEY] });
    },
  });
};

export const useIncrementAnnouncementView = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.rpc('increment_announcement_view', { announcement_id: id });
    },
  });
};

export const useIncrementAnnouncementClick = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.rpc('increment_announcement_click', { announcement_id: id });
    },
  });
};
