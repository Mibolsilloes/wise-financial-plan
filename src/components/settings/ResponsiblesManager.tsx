import { useState } from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResponsibles } from "@/contexts/ResponsiblesContext";
import { toast } from "sonner";

const PRESET_COLORS = ["#26805D", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6", "#EF4444"];

export function ResponsiblesManager() {
  const { responsibles, addResponsible, deleteResponsible } = useResponsibles();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const canAdd = responsibles.length < 3;

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Introduce un nombre");
      return;
    }
    setSaving(true);
    const { error } = await addResponsible(name, color);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Responsable añadido");
    setName("");
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await deleteResponsible(id);
    if (error) toast.error(error.message);
    else toast.success(`Se eliminó "${name}"`);
  };

  return (
    <div className="glass rounded-xl p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Personas responsables</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Define hasta 3 personas que pueden ser asignadas a una transacción (por ejemplo, miembros de tu hogar).
      </p>

      {/* List */}
      <div className="space-y-2 mb-6">
        {responsibles.length === 0 ? (
          <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border text-sm text-muted-foreground text-center">
            Aún no has añadido ningún responsable.
          </div>
        ) : (
          responsibles.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="font-medium">{r.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(r.id, r.name)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add form */}
      {canAdd ? (
        <div className="space-y-3 pt-4 border-t border-border">
          <Label>Añadir responsable</Label>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan García"
              maxLength={50}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={saving} className="gap-2">
              <Plus className="w-4 h-4" />
              Añadir
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Color:</span>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  color === c ? "border-foreground scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{responsibles.length}/3 responsables usados</p>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm text-warning">
          Has alcanzado el máximo de 3 responsables. Elimina uno para añadir otro.
        </div>
      )}
    </div>
  );
}
