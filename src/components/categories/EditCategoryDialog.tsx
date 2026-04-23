import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HexColorPicker } from "react-colorful";

// Helper functions for color conversion
const hslToHex = (hslString: string): string => {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslString.startsWith('#') ? hslString : '#ff8800';
  
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

const colorPalette = [
  "hsl(0, 84%, 60%)",
  "hsl(25, 95%, 53%)",
  "hsl(45, 93%, 47%)",
  "hsl(120, 60%, 50%)",
  "hsl(160, 84%, 39%)",
  "hsl(172, 66%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(217, 91%, 60%)",
  "hsl(250, 70%, 60%)",
  "hsl(280, 65%, 60%)",
  "hsl(310, 70%, 55%)",
  "hsl(340, 82%, 52%)",
];

interface CategoryItem {
  id: string;
  name: string;
  color: string;
  subcategories: number;
  total: number;
  type: string;
  keywords: string[];
}

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryItem | null;
  onSave: (id: string, updates: { name: string; color: string; keywords: string[] }) => void;
}

import { useCategories } from "@/contexts/CategoriesContext";
import { toast } from "sonner";

export function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: EditCategoryDialogProps) {
  const { getCategoryById, addSubcategory, removeSubcategory } = useCategories();
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editColorHex, setEditColorHex] = useState("#ff8800");
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  const fullCategory = category ? getCategoryById(category.id) : undefined;
  const subcategories = fullCategory?.subcategories ?? [];

  useEffect(() => {
    if (category) {
      setEditName(category.name);
      setEditColor(category.color);
      setEditColorHex(hslToHex(category.color));
      setEditKeywords(category.keywords || []);
      setNewKeyword("");
      setNewSubcategory("");
    }
  }, [category]);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !editKeywords.includes(newKeyword.trim())) {
      setEditKeywords([...editKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setEditKeywords(editKeywords.filter(k => k !== keyword));
  };

  const handleAddSubcategory = async () => {
    if (!category) return;
    const normalized = newSubcategory.trim().replace(/\s+/g, " ");
    if (!normalized) return;
    const isDuplicate = subcategories.some(
      (s) => s.trim().toLowerCase() === normalized.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("Ya existe una subcategoría con ese nombre");
      return;
    }
    setSavingSub(true);
    const { error } = await addSubcategory(category.id, normalized);
    setSavingSub(false);
    if (error) {
      toast.error("No se pudo crear la subcategoría", { description: error.message });
      return;
    }
    setNewSubcategory("");
    toast.success(`Subcategoría "${normalized}" añadida`);
  };

  const handleRemoveSubcategory = async (name: string) => {
    if (!category) return;
    const { error } = await removeSubcategory(category.id, name);
    if (error) {
      toast.error("No se pudo eliminar la subcategoría", { description: error.message });
      return;
    }
    toast.success(`Subcategoría "${name}" eliminada`);
  };

  const handleSave = () => {
    if (category) {
      onSave(category.id, {
        name: editName,
        color: editColor,
        keywords: editKeywords,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Editar Categoría</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {/* Category Name */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Nombre de la Categoría</Label>
            <Input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-primary/20 border-primary/30 focus:border-primary"
              style={{ 
                backgroundColor: editColor ? `${editColor}20` : undefined,
                borderColor: editColor ? `${editColor}50` : undefined
              }}
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Color de la Categoría</Label>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setEditColor(color);
                    setEditColorHex(hslToHex(color));
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all duration-200 hover:scale-110",
                    editColor === color 
                      ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110" 
                      : "hover:ring-1 hover:ring-foreground/30"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Color Preview with Hex and Full Picker */}
            <div className="flex items-center gap-3 mt-3">
              <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer hover:ring-2 hover:ring-foreground/20 transition-all"
                    style={{ backgroundColor: editColorHex }}
                  />
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-3 bg-card border-border z-50" 
                  align="start"
                  sideOffset={8}
                >
                  <div className="space-y-3">
                    <HexColorPicker 
                      color={editColorHex} 
                      onChange={(newColor) => {
                        setEditColorHex(newColor);
                        setEditColor(hexToHsl(newColor));
                      }}
                    />
                    <Input 
                      value={editColorHex}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditColorHex(val);
                        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                          setEditColor(hexToHsl(val));
                        }
                      }}
                      className="font-mono text-sm uppercase"
                      placeholder="#ff8800"
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <Input 
                value={editColorHex}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditColorHex(val);
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    setEditColor(hexToHsl(val));
                  }
                }}
                className="flex-1 font-mono text-sm uppercase"
                placeholder="#ff8800"
              />
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Palabras para identificar la categoría</Label>
            
            {/* Keywords Tags */}
            {editKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editKeywords.map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="secondary"
                    className="pl-2.5 pr-1 py-1 gap-1 bg-muted/50"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Add Keyword Input */}
            <div className="flex gap-2">
              <Input 
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Añadir palabra clave"
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={handleAddKeyword}
                className="bg-success hover:bg-success/90 text-success-foreground px-4"
              >
                Añadir
              </Button>
            </div>
          </div>

          {/* Subcategorías */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Subcategorías
              <span className="ml-2 text-xs text-muted-foreground/70">
                (sirven para gastos e ingresos)
              </span>
            </Label>

            {subcategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <Badge
                    key={sub}
                    variant="secondary"
                    className="pl-2.5 pr-1 py-1 gap-1 bg-muted/50"
                  >
                    {sub}
                    <button
                      onClick={() => handleRemoveSubcategory(sub)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Esta categoría aún no tiene subcategorías. Añade una abajo para clasificar mejor tus movimientos.
              </p>
            )}

            <div className="flex gap-2">
              <Input
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddSubcategory())
                }
                placeholder="Nueva subcategoría"
                className="flex-1"
                disabled={savingSub}
              />
              <Button
                type="button"
                onClick={handleAddSubcategory}
                disabled={savingSub || !newSubcategory.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
              >
                Añadir
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            className="w-full bg-success hover:bg-success/90 text-success-foreground font-medium py-5"
          >
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
