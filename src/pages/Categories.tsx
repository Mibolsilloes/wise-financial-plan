import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { 
  Plus, 
  Edit2, 
  Trash2,
  BarChart3,
  Utensils,
  Car,
  Home,
  ShoppingCart,
  Briefcase,
  Heart,
  Gamepad2,
  GraduationCap,
  Shirt,
  Plane,
  PawPrint,
  Gift,
  Tv,
  Wrench,
  Wallet,
  Search,
  X,
  FileBarChart,
  TrendingUp,
  Laptop,
  Zap,
  Cat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { HexColorPicker } from "react-colorful";
import { categories as mockDataCategories } from "@/data/mockData";

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

const categoryIcons: Record<string, React.ElementType> = {
  "Alimentación": Utensils,
  "Transporte": Car,
  "Hogar": Home,
  "Supermercado": ShoppingCart,
  "Salario": Briefcase,
  "Salud": Heart,
  "Ocio": Gamepad2,
  "Educación": GraduationCap,
  "Ropa": Shirt,
  "Viajes": Plane,
  "Mascotas": Cat,
  "Donaciones": Gift,
  "Suscripciones": Tv,
  "Servicios": Wrench,
  "Otros": Wallet,
  "Freelance": Laptop,
  "Inversiones": TrendingUp,
  "Vivienda": Home,
  "Suministros": Zap,
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

// Transform mockData categories to match the expected format
const defaultCategories = mockDataCategories.map(cat => ({
  id: parseInt(cat.id),
  name: cat.name,
  color: cat.color,
  subcategories: cat.subcategories?.length || 0,
  total: cat.totalAmount,
  type: cat.type,
  keywords: [] as string[],
}));

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(defaultCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<typeof defaultCategories[0] | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editColorHex, setEditColorHex] = useState("#ff8800");
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (category: typeof defaultCategories[0]) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditColor(category.color);
    setEditColorHex(hslToHex(category.color));
    setEditKeywords(category.keywords || []);
    setNewKeyword("");
    setIsEditDialogOpen(true);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !editKeywords.includes(newKeyword.trim())) {
      setEditKeywords([...editKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setEditKeywords(editKeywords.filter(k => k !== keyword));
  };

  const handleSaveEdit = () => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: editName, color: editColor, keywords: editKeywords }
          : cat
      ));
      setIsEditDialogOpen(false);
      setEditingCategory(null);
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
              Organiza tus transacciones por categorías
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

        {/* Categories List */}
        <div className="space-y-3">
          {filteredCategories.map((category, index) => {
            const Icon = categoryIcons[category.name] || Wallet;
            const isIncome = category.type === "ingreso";
            
            return (
              <div
                key={category.id}
                className="glass rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-200 animate-scale-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-stretch">
                  {/* Color Bar */}
                  <div 
                    className="w-1.5 shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Icon, Name, Badge */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div 
                          className="p-2.5 rounded-xl shrink-0"
                          style={{ backgroundColor: `${category.color}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: category.color }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{category.name}</h3>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-[10px] shrink-0",
                                isIncome 
                                  ? "bg-success/10 text-success border-success/20" 
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              )}
                            >
                              {isIncome ? "Ingreso" : "Gasto"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {category.subcategories > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {category.subcategories} subcategorías
                              </span>
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              isIncome ? "text-success" : "text-foreground"
                            )}>
                              {formatCurrency(category.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div 
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => navigate(`/categorias/${category.id}/relatorio`)}
                        >
                          <FileBarChart className="w-4 h-4" />
                          Informes
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No se encontraron categorías</p>
          </div>
        )}

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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

              {/* Save Button */}
              <Button 
                onClick={handleSaveEdit}
                className="w-full bg-success hover:bg-success/90 text-success-foreground font-medium py-5"
              >
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
