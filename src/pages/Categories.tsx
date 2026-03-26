import { useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/contexts/CategoriesContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCategoryItem } from "@/components/categories/SortableCategoryItem";
import { EditCategoryDialog } from "@/components/categories/EditCategoryDialog";
import { toast } from "sonner";

export default function Categories() {
  const { categories: contextCategories, deleteCategory, updateCategory } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Transform context categories to local format
  const categories = contextCategories.map((cat, index) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    subcategories: cat.subcategories?.length || 0,
    total: cat.totalAmount,
    type: cat.type,
    keywords: cat.keywords || [],
    position: cat.position ?? index,
  }));

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<typeof categories[0] | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<typeof categories[0] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredCategories = categories
    .filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.position - b.position);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const sortedItems = [...categories].sort((a, b) => a.position - b.position);
      const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
      const newIndex = sortedItems.findIndex((item) => item.id === over.id);
      
      const reordered = arrayMove(sortedItems, oldIndex, newIndex);
      
      // Update positions in DB
      reordered.forEach((item, index) => {
        if (item.position !== index) {
          updateCategory(item.id, { position: index });
        }
      });
    }
  }, [categories, updateCategory]);

  const handleEditClick = (category: typeof categories[0]) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (id: string, updates: { name: string; color: string; keywords: string[] }) => {
    updateCategory(id, updates);
  };

  const handleDeleteClick = (category: typeof categories[0]) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
      toast.success(`Categoría "${deletingCategory.name}" eliminada`);
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Categorías</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Organiza tus transacciones por categorías. Arrastra para reordenar.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary">
                <Plus className="w-4 h-4" />
                Nueva categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Crear nueva categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Nombre de la categoría</Label>
                  <Input id="name" placeholder="Ej: Inversiones" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2 mt-1.5">
                    {["hsl(340, 82%, 52%)", "hsl(25, 95%, 53%)", "hsl(45, 93%, 47%)", "hsl(160, 84%, 39%)", "hsl(217, 91%, 60%)", "hsl(280, 65%, 60%)"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-foreground/50 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea id="description" placeholder="Describe esta categoría..." className="mt-1.5" />
                </div>
                <Button className="w-full">Crear categoría</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorías..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories List with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredCategories.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {filteredCategories.map((category, index) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  index={index}
                  onEditClick={handleEditClick}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No se encontraron categorías</p>
          </div>
        )}

        {/* Edit Category Dialog */}
        <EditCategoryDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          category={editingCategory}
          onSave={handleSaveEdit}
        />

        {/* Delete Category Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar la categoría "{deletingCategory?.name}"? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
