"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Archive, Search, Plus, Trash2, ArrowLeft, LogOut } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

// --- Componentes de UI simulados ---
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>{children}</div>
)
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 border-b ${className}`}>{children}</div>
)
const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h2 className={`text-xl font-semibold tracking-tight ${className}`}>{children}</h2>
)
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
)
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }: { children: React.ReactNode, onClick?: React.MouseEventHandler<HTMLButtonElement>, variant?: string, size?: string, className?: string, disabled?: boolean, [key: string]: any }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
  const sizeClasses = size === 'sm' ? 'h-9 px-3' : 'h-10 py-2 px-4';
  const variantClasses = variant === 'outline'
    ? 'border border-input bg-transparent hover:bg-gray-100'
    : 'bg-blue-600 text-white hover:bg-blue-700';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  return (
    <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
const Input = ({ className, ...props }: { className?: string, [key: string]: any }) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
)
const Textarea = ({ className, ...props }: { className?: string, [key: string]: any }) => (
    <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
)
const Label = ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>{children}</label>
)
const Alert = ({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: 'default' | 'destructive' }) => {
  const variantClasses = variant === 'destructive' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800';
  return <div className={`relative w-full rounded-lg border p-4 ${variantClasses} ${className}`}>{children}</div>
}
const AlertDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`text-sm ${className}`}>{children}</div>
)

// --- Funciones de autenticación simuladas ---
const isAuthenticated = () => typeof window !== 'undefined' && !!localStorage.getItem('authToken');
const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        window.location.reload();
    }
};

interface Producto {
    id: number;
    nombre: string;
    stock: number;
}

interface ProductoEnGuia extends Producto {
    cantidad: number;
}

const initialGuiaData = {
    destino: "",
    motivo: "",
    observaciones: "",
    fechaSalida: new Date().toISOString().split("T")[0],
    
};

export default function GuiaSalidaPage() {
    const [guiaData, setGuiaData] = useState(initialGuiaData);
    const [productosEnGuia, setProductosEnGuia] = useState<ProductoEnGuia[]>([]);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Producto[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // --- Lógica de Búsqueda de Productos ---
    const searchProductos = useCallback(async (term: string) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8080/api/productos/buscar?nombre=${term}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Error al buscar productos");
            const data: Producto[] = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error(error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);
    
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            searchProductos(searchTerm);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, searchProductos]);

    // --- Lógica para manejar la lista de productos en la guía ---
    const handleAddProducto = (producto: Producto) => {
        if (!productosEnGuia.some(p => p.id === producto.id)) {
            setProductosEnGuia([...productosEnGuia, { ...producto, cantidad: 1 }]);
        }
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleRemoveProducto = (productoId: number) => {
        setProductosEnGuia(productosEnGuia.filter(p => p.id !== productoId));
    };

    const handleCantidadChange = (productoId: number, cantidad: number) => {
        setProductosEnGuia(productosEnGuia.map(p =>
            p.id === productoId ? { ...p, cantidad: Math.max(0, cantidad) } : p
        ));
    };

    const handleInputChange = (field: keyof typeof initialGuiaData, value: string) => {
        setGuiaData(prev => ({ ...prev, [field]: value }));
    };

    // --- Lógica de Envío de Formulario ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (productosEnGuia.length === 0) {
            setMessage({ type: "error", text: "Debes agregar al menos un producto a la guía." });
            return;
        }
        setIsLoading(true);
        setMessage(null);

        const payload = {
  ...guiaData,
  fechaSalida: new Date(guiaData.fechaSalida + "T00:00:00Z").toISOString(),
  items: productosEnGuia.map(p => ({
      productoId: p.id,
      cantidad: p.cantidad,
  })),
};


        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch("http://localhost:8080/api/guias-salida", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al registrar la guía de salida.");
            }

            setMessage({ type: "success", text: "Guía de salida registrada exitosamente." });
            setGuiaData(initialGuiaData);
            setProductosEnGuia([]);

        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error de conexión con el servidor." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
            <header className="border-b bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Archive className="w-7 h-7" />
                        Guía de Salida de Productos
                    </h1>
                    <Button onClick={logout} variant="outline" size="sm">
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                    </Button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Guía</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="destino">Destino</Label>
                                <Input id="destino" value={guiaData.destino} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("destino", e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="motivo">Motivo de Salida</Label>
                                <Input id="motivo" value={guiaData.motivo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("motivo", e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="fechaSalida">Fecha de Salida</Label>
                                <Input id="fechaSalida" type="date" value={guiaData.fechaSalida} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("fechaSalida", e.target.value)} required />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="observaciones">Observaciones</Label>
                                <Textarea id="observaciones" value={guiaData.observaciones} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("observaciones", e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos en la Guía</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Label htmlFor="search-producto">Buscar y Agregar Producto</Label>
                                <div className="flex items-center">
                                    <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                                    <Input id="search-producto" placeholder="Escribe para buscar..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" />
                                </div>
                                {isSearching && <p className="text-sm text-gray-500 mt-1">Buscando...</p>}
                                {searchResults.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                        {searchResults.map(p => (
                                            <li key={p.id} onClick={() => handleAddProducto(p)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                                {p.nombre} (Stock: {p.stock})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="space-y-2">
                                {productosEnGuia.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No hay productos en la guía.</p>
                                ) : (
                                    productosEnGuia.map(p => (
                                        <div key={p.id} className="flex items-center gap-4 p-2 border rounded-md">
                                            <div className="flex-grow">
                                                <p className="font-medium">{p.nombre}</p>
                                                <p className="text-sm text-gray-500">Stock disponible: {p.stock}</p>
                                            </div>
                                            <Input type="number" value={p.cantidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCantidadChange(p.id, parseInt(e.target.value))} className="w-24" min="1" max={p.stock} />
                                            <Button variant="outline" size="sm" onClick={() => handleRemoveProducto(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                        </div>
                                    ))
                                )}  
                            </div>
                        </CardContent>
                    </Card>

                    {message && (
                        <Alert variant={message.type === "error" ? "destructive" : "default"}>
                            <AlertDescription>{message.text}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? "Registrando Salida..." : "Registrar Guía de Salida"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
      </DashboardLayout>
    );
}
