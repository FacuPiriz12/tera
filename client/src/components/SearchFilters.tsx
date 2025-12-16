import { useState } from "react";
import { SlidersHorizontal, Folder, FileText, FileImage, FileSpreadsheet, FileVideo, FileAudio, File, Box, Palette, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface SearchFiltersState {
  fileTypes: string[];
  dateRange: string;
  sizeRange: string;
  owner: string;
  folder: string;
  tags: string;
}

interface SearchFiltersProps {
  onFiltersChange?: (filters: SearchFiltersState) => void;
  onSearch?: (filters: SearchFiltersState) => void;
}

const FILE_TYPES = [
  { id: "folders", label: "Carpetas", icon: Folder, color: "text-yellow-600" },
  { id: "files", label: "Archivos", icon: File, color: "text-gray-500" },
  { id: "note", label: "Nota", icon: FileText, color: "text-cyan-500" },
  { id: "canvas", label: "Canvas", icon: Palette, color: "text-pink-400" },
  { id: "pdf", label: "PDF", icon: FileText, color: "text-red-500" },
  { id: "document", label: "Documento", icon: FileText, color: "text-blue-500" },
  { id: "spreadsheet", label: "Hoja de cálculo", icon: FileSpreadsheet, color: "text-green-600" },
  { id: "presentation", label: "Presentación", icon: FileText, color: "text-orange-500" },
  { id: "image", label: "Imagen", icon: FileImage, color: "text-green-500" },
  { id: "audio", label: "Audio", icon: FileAudio, color: "text-purple-500" },
  { id: "video", label: "Video", icon: FileVideo, color: "text-blue-600" },
  { id: "drawing", label: "Dibujo", icon: Palette, color: "text-pink-500" },
  { id: "3d", label: "3D", icon: Box, color: "text-orange-600" },
];

const DATE_OPTIONS = [
  { id: "any", label: "En cualquier momento" },
  { id: "last_day", label: "El último día" },
  { id: "last_week", label: "La semana pasada" },
  { id: "last_month", label: "El mes pasado" },
  { id: "last_year", label: "El año pasado" },
  { id: "custom", label: "Intervalo personalizado" },
];

const SIZE_OPTIONS = [
  { id: "any", label: "Cualquier tamaño" },
  { id: "0-1mb", label: "0 - 1 MB" },
  { id: "1-5mb", label: "1 - 5 MB" },
  { id: "5-25mb", label: "5 - 25 MB" },
  { id: "25-100mb", label: "25 - 100 MB" },
  { id: "100mb-1gb", label: "100 MB - 1 GB" },
  { id: "1gb+", label: "+1 GB" },
];

const defaultFilters: SearchFiltersState = {
  fileTypes: [],
  dateRange: "any",
  sizeRange: "any",
  owner: "",
  folder: "",
  tags: "",
};

export default function SearchFilters({ onFiltersChange, onSearch }: SearchFiltersProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>(defaultFilters);

  const handleFileTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.fileTypes, typeId]
      : filters.fileTypes.filter((t) => t !== typeId);
    
    const newFilters = { ...filters, fileTypes: newTypes };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDateRangeChange = (value: string) => {
    const newFilters = { ...filters, dateRange: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleSizeRangeChange = (value: string) => {
    const newFilters = { ...filters, sizeRange: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleOwnerChange = (value: string) => {
    const newFilters = { ...filters, owner: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleFolderChange = (value: string) => {
    const newFilters = { ...filters, folder: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleTagsChange = (value: string) => {
    const newFilters = { ...filters, tags: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClearAll = () => {
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const handleSearch = () => {
    onSearch?.(filters);
    setIsOpen(false);
    
    // Build query params from filters
    const params = new URLSearchParams();
    if (filters.fileTypes.length > 0) {
      params.set('types', filters.fileTypes.join(','));
    }
    if (filters.dateRange !== 'any') {
      params.set('date', filters.dateRange);
    }
    if (filters.sizeRange !== 'any') {
      params.set('size', filters.sizeRange);
    }
    if (filters.owner) {
      params.set('owner', filters.owner);
    }
    if (filters.folder) {
      params.set('folder', filters.folder);
    }
    if (filters.tags) {
      params.set('tags', filters.tags);
    }
    
    // Navigate to my-files with filters
    const queryString = params.toString();
    setLocation(`/my-files${queryString ? `?${queryString}` : ''}`);
  };

  const hasActiveFilters = 
    filters.fileTypes.length > 0 || 
    filters.dateRange !== "any" || 
    filters.sizeRange !== "any" || 
    filters.owner !== "" ||
    filters.folder !== "" ||
    filters.tags !== "";

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={`h-8 w-8 rounded-md hover:bg-accent/50 ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground'}`}
        data-testid="button-search-filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[360px] sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="text-lg font-semibold">Filtros</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <Accordion type="multiple" defaultValue={["file-types", "date-range", "size"]} className="w-full">
              <AccordionItem value="file-types" className="border-b border-border">
                <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-accent/30">
                  <span className="font-medium text-sm">Filtros</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-1">
                    {FILE_TYPES.map((type) => {
                      const isSelected = filters.fileTypes.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleFileTypeChange(type.id, !isSelected)}
                          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                          data-testid={`checkbox-filter-${type.id}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-gray-200 border-gray-400' 
                              : 'border-gray-300 bg-gray-100'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-gray-800" strokeWidth={3} />}
                          </div>
                          <type.icon className={`h-5 w-5 ${type.color}`} />
                          <span className="text-sm font-normal text-foreground">
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="date-range" className="border-b border-border">
                <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-accent/30">
                  <span className="font-medium text-sm">Fecha de actualización</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-1">
                    {DATE_OPTIONS.map((option) => {
                      const isSelected = filters.dateRange === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleDateRangeChange(option.id)}
                          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                          data-testid={`radio-date-${option.id}`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-gray-200 border-gray-400' 
                              : 'border-gray-300 bg-gray-100'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />}
                          </div>
                          <span className="text-sm font-normal text-foreground">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="owner" className="border-b border-border">
                <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-accent/30">
                  <span className="font-medium text-sm">Propiedad</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Input
                    type="text"
                    placeholder="Nombres o correos electrónicos"
                    value={filters.owner}
                    onChange={(e) => handleOwnerChange(e.target.value)}
                    className="w-full"
                    data-testid="input-filter-owner"
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="folder" className="border-b border-border">
                <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-accent/30">
                  <span className="font-medium text-sm">En carpeta</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Input
                    type="text"
                    placeholder="En todas las carpetas"
                    value={filters.folder}
                    onChange={(e) => handleFolderChange(e.target.value)}
                    className="w-full"
                    data-testid="input-filter-folder"
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="size" className="border-b border-border">
                <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-accent/30">
                  <span className="font-medium text-sm">Tamaño</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-1">
                    {SIZE_OPTIONS.map((option) => {
                      const isSelected = filters.sizeRange === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSizeRangeChange(option.id)}
                          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                          data-testid={`radio-size-${option.id}`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-gray-200 border-gray-400' 
                              : 'border-gray-300 bg-gray-100'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />}
                          </div>
                          <span className="text-sm font-normal text-foreground">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tags" className="border-b border-border">
                <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-accent/30">
                  <span className="font-medium text-sm">Etiquetas</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Input
                    type="text"
                    placeholder="Buscar etiquetas..."
                    value={filters.tags}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full"
                    data-testid="input-filter-tags"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-border flex flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={!hasActiveFilters}
              data-testid="button-clear-filters"
            >
              Eliminar todo
            </Button>
            <Button
              onClick={handleSearch}
              data-testid="button-apply-filters"
            >
              Buscar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
