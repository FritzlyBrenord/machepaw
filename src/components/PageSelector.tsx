// ============================================
// PAGE SELECTOR - Manage and switch between pages
// ============================================

import { Plus, Settings, Trash2, Home, FileText, ChevronDown, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEditorStore } from '@/store/editor-store';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function PageSelector() {
  const { project, currentPageId, setCurrentPage, addPage, deletePage, duplicatePage } = useEditorStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const currentPage = project.pages.find((p) => p.id === currentPageId);
  const protectedSlugs = new Set([
    '/',
    '/products',
    '/produits',
    '/product',
    '/produit',
    '/cart',
    '/panier',
    '/checkout',
    '/order-confirmation',
    '/confirmation',
    '/account',
    '/compte',
    '/connexion',
    '/login',
    '/register',
    '/inscription',
    '/favoris',
    '/wishlist',
    '/commande',
    '/order-tracking',
  ]);

  const handleAddPage = () => {
    if (!newPageName || !newPageSlug) return;

    const newPage = {
      id: `page-${uuidv4()}`,
      name: newPageName,
      slug: newPageSlug.startsWith('/') ? newPageSlug : `/${newPageSlug}`,
      isHome: false,
      meta: {
        title: newPageName,
        description: '',
      },
      sections: [
        {
          id: `sect-${uuidv4()}`,
          type: 'headerModern' as const,
          order: 0,
          props: {
            logo: { text: project.name },
            navigation: [],
            styles: {
              backgroundColor: '#ffffff',
              textColor: '#1a1a1a',
              accentColor: project.settings.primaryColor,
            },
          },
        },
        {
          id: `sect-${uuidv4()}`,
          type: 'footerModern' as const,
          order: 1,
          props: {
            logo: { text: project.name },
            copyright: `© ${new Date().getFullYear()} ${project.name}. Tous droits réservés.`,
            styles: {
              backgroundColor: '#1a1a1a',
              textColor: '#ffffff',
              accentColor: project.settings.primaryColor,
            },
          },
        },
      ],
    };

    addPage(newPage);
    setIsDialogOpen(false);
    setNewPageName('');
    setNewPageSlug('');
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {currentPage?.isHome ? (
              <Home className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span className="max-w-[120px] truncate">{currentPage?.name}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {project.pages.map((page) => (
            <DropdownMenuItem
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                {page.isHome ? <Home className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {page.name}
              </span>
              {page.id === currentPageId && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle page
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nom de la page</Label>
                  <Input
                    value={newPageName}
                    onChange={(e) => {
                      setNewPageName(e.target.value);
                      if (!newPageSlug) {
                        setNewPageSlug(`/${e.target.value.toLowerCase().replace(/\s+/g, '-')}`);
                      }
                    }}
                    placeholder="ex: À propos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL (slug)</Label>
                  <Input
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    placeholder="ex: /a-propos"
                  />
                </div>
                <Button onClick={handleAddPage} className="w-full">
                  Créer la page
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Page Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => duplicatePage(currentPageId)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Dupliquer la page
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
                deletePage(currentPageId);
              }
            }}
            disabled={
              project.pages.length <= 1 ||
              Boolean(currentPage?.slug && protectedSlugs.has(currentPage.slug))
            }
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer la page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
