"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart, Plus, Minus, Trash2, Search, Save, User, Phone, Package } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"



// --- INTERFACES ---
interface Producto {
    id: number
    nombre: string
    precio: number
    stock: number
    categoria?: string
}

interface Cliente {
    id: number
    nombre: string
    telefono: string
}

interface ItemVenta {
    producto: Producto
    cantidad: number
    subtotal: number
}

interface Cotizacion {
    clienteNombre: string
    clienteTelefono: string
    marcaCelular: string
    detalleCelular: string
    observaciones: string
}

// --- HOOK DEBUNCE (para optimizar la búsqueda) ---
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


// --- HELPERS DE AUTENTICACIÓN ---
const isAuthenticated = (): boolean => {
    try {
        return localStorage.getItem("authToken") !== null;
    } catch (e) {
        return false;
    }
};

const getUserData = (): { username: string | null; userRole: string | null } => {
    try {
        return {
            username: localStorage.getItem("username"),
            userRole: localStorage.getItem("userRole"),
        };
    } catch (e) {
        return { username: null, userRole: null };
    }
};
// --- COMPONENTE PRINCIPAL ---
export default function VentasPage() {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [productSearchResults, setProductSearchResults] = useState<Producto[]>([]);
    const [clienteSearchResults, setClienteSearchResults] = useState<Cliente[]>([]);
    const [carrito, setCarrito] = useState<ItemVenta[]>([]);
    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [message, setMessage] = useState("");
    const [processingVenta, setProcessingVenta] = useState(false);
    const [activeTab, setActiveTab] = useState("cotizacion");
    
    const [cotizacion, setCotizacion] = useState<Cotizacion>({
        clienteNombre: "",
        clienteTelefono: "",
        marcaCelular: "",
        detalleCelular: "",
        observaciones: "",
    });

    const debouncedProductSearchTerm = useDebounce(productSearchTerm, 300);
    const debouncedClienteSearchTerm = useDebounce(cotizacion.clienteNombre, 300);

    const { username } = getUserData();

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            setIsAuth(authenticated);
            setLoading(false);
             if (!authenticated) {
                console.error("Usuario no autenticado.");
            }
        };
        checkAuth();
    }, []);

    // --- LÓGICA DE BÚSQUEDA ---
    const searchProducts = useCallback(async (term: string) => {
        if (term.length < 2) {
            setProductSearchResults([]);
            return;
        }
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`http://localhost:8080/api/productos/buscar?nombre=${term}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Error al buscar productos");
            const data: Producto[] = await response.json();
            setProductSearchResults(data);
        } catch (error) {
            console.error("Error en searchProducts:", error);
            setMessage("Error al buscar productos.");
        }
    }, []);

    const searchClientes = useCallback(async (term: string) => {
        if (term.length < 2) {
            setClienteSearchResults([]);
            return;
        }
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`http://localhost:8080/api/clientes/buscar?nombre=${term}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Error al buscar clientes.");
            const data: Cliente[] = await response.json();
            setClienteSearchResults(data);
        } catch (error) {
            console.error("Error en searchClientes:", error);
            setMessage("Error al buscar clientes.");
        }
    }, []);

    useEffect(() => {
        if (isAuth && debouncedProductSearchTerm) {
            searchProducts(debouncedProductSearchTerm);
        } else {
            setProductSearchResults([]);
        }
    }, [debouncedProductSearchTerm, isAuth, searchProducts]);

    useEffect(() => {
        if (isAuth && debouncedClienteSearchTerm) {
            searchClientes(debouncedClienteSearchTerm);
        } else {
            setClienteSearchResults([]);
        }
    }, [debouncedClienteSearchTerm, isAuth, searchClientes]);

    // --- LÓGICA DEL FORMULARIO Y CARRITO ---
    const handleCotizacionChange = (field: keyof Cotizacion, value: string) => {
        setCotizacion((prev) => ({ ...prev, [field]: value }));
    };

    const agregarAlCarrito = (producto: Producto, cantidadToAdd: number) => {
        if (cantidadToAdd <= 0) return;
    
        if (cantidadToAdd > producto.stock) {
            setMessage(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
            return;
        }
    
        const itemExistente = carrito.find((item) => item.producto.id === producto.id);
    
        if (itemExistente) {
            const nuevaCantidad = itemExistente.cantidad + cantidadToAdd;
            if (nuevaCantidad > producto.stock) {
                setMessage(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
                return;
            }
            setCarrito(
                carrito.map((item) =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * producto.precio }
                        : item
                )
            );
        } else {
            const nuevoItem: ItemVenta = {
                producto,
                cantidad: cantidadToAdd,
                subtotal: cantidadToAdd * producto.precio,
            };
            setCarrito([...carrito, nuevoItem]);
        }
        setMessage(`"${producto.nombre}" agregado al carrito.`);
    };

    const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
        const itemInCart = carrito.find(item => item.producto.id === productoId);
        if (!itemInCart) return;

        if (nuevaCantidad > itemInCart.producto.stock) {
            setMessage(`Stock insuficiente para ${itemInCart.producto.nombre}. Disponible: ${itemInCart.producto.stock}`);
            return;
        }

        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(productoId);
            return;
        }

        setCarrito(
            carrito.map((item) =>
                item.producto.id === productoId
                    ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.producto.precio }
                    : item
            )
        );
        setMessage("");
    };
    
    const eliminarDelCarrito = (productoId: number) => {
        setCarrito(carrito.filter((item) => item.producto.id !== productoId));
    };

    const calcularTotal = () => {
        return carrito.reduce((total, item) => total + item.subtotal, 0).toFixed(2);
    };

    const procesarVenta = async () => {
        if (carrito.length === 0) {
            setMessage("Error: El carrito está vacío.");
            return;
        }
        if (!cotizacion.clienteNombre.trim()) {
            setMessage("Error: Por favor, completa la información del cliente.");
            setActiveTab("cotizacion");
            return;
        }

        setProcessingVenta(true);
        setMessage("");

        const ventaData = {
            cotizacion,
            items: carrito.map((item) => ({
                productoId: item.producto.id,
                cantidad: item.cantidad,
                precio: item.producto.precio,
            })),
            total: parseFloat(calcularTotal()),
            fecha: new Date().toISOString(),
            registradoPor: username,
        };

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/ventas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ventaData)
            });

            if (response.ok) {
                setMessage("Venta procesada exitosamente.");
                setCarrito([]);
                setCotizacion({
                    clienteNombre: "",
                    clienteTelefono: "",
                    marcaCelular: "",
                    detalleCelular: "",
                    observaciones: "",
                });
                setProductSearchTerm("");
                setProductSearchResults([]);
                setClienteSearchResults([]);
            } else {
                const errorData = await response.text();
                setMessage(`Error al procesar la venta: ${errorData}`);
            }
        } catch (error) {
            console.error("Error en procesarVenta:", error);
            setMessage("Error de conexión al procesar la venta.");
        } finally {
            setProcessingVenta(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuth) {
        return (
             <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 border rounded-lg shadow-lg bg-white">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
                    <p className="text-gray-700">Por favor, inicia sesión para acceder a esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8" />
                        Cotización y Venta
                    </h1>
                    <p className="text-muted-foreground mt-2">Gestiona cotizaciones y procesa ventas de productos</p>
                </div>

                {message && (
                    <Alert className={`animate-in fade-in-50 ${message.toLowerCase().includes("error") || message.toLowerCase().includes("insuficiente") ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="cotizacion">
                            <User className="w-4 h-4 mr-2" />
                            Cotización
                        </TabsTrigger>
                        <TabsTrigger value="productos">
                            <Package className="w-4 h-4 mr-2" />
                            Productos
                        </TabsTrigger>
                        <TabsTrigger value="carrito">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Carrito ({carrito.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cotizacion" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Cliente</CardTitle>
                                <CardDescription>Busca un cliente existente o registra los datos de uno nuevo.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                     <Label htmlFor="clienteNombre">Buscar Cliente o Registrar Nuevo *</Label>
                                     <div className="relative">
                                         <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                         <Input 
                                            id="clienteNombre" 
                                            value={cotizacion.clienteNombre} 
                                            onChange={(e) => handleCotizacionChange("clienteNombre", e.target.value)} 
                                            placeholder="Buscar por nombre..." 
                                            className="pl-10" 
                                            required 
                                            autoComplete="off"
                                         />
                                        {clienteSearchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {clienteSearchResults.map((cliente) => (
                                                    <div
                                                    key={cliente.id}
                                                    className="p-3 hover:bg-slate-100 cursor-pointer"
                                                    onClick={() => {
                                                        setCotizacion(prev => ({
                                                        ...prev,
                                                        clienteNombre: cliente.nombre,
                                                        clienteTelefono: cliente.telefono || ""
                                                        }));
                                                        setClienteSearchResults([]);
                                                    }}
                                                    >
                                                    <p className="font-semibold">{cliente.nombre}</p>
                                                    <p className="text-sm text-gray-500">{cliente.telefono}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                     </div>
                                 </div>
                                 <div className="space-y-2">
                                     <Label htmlFor="clienteTelefono">Teléfono del Cliente</Label>
                                     <div className="relative">
                                         <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                         <Input id="clienteTelefono" value={cotizacion.clienteTelefono} onChange={(e) => handleCotizacionChange("clienteTelefono", e.target.value)} placeholder="+51 999 999 999" className="pl-10" />
                                     </div>
                                 </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                         <Label htmlFor="marcaCelular">Marca del Celular</Label>
                                         <Input id="marcaCelular" value={cotizacion.marcaCelular} onChange={(e) => handleCotizacionChange("marcaCelular", e.target.value)} placeholder="ej: iPhone, Samsung, Xiaomi" />
                                     </div>
                                     <div>
                                         <Label htmlFor="detalleCelular">Modelo del Celular</Label>
                                         <Input id="detalleCelular" value={cotizacion.detalleCelular} onChange={(e) => handleCotizacionChange("detalleCelular", e.target.value)} placeholder="ej: iPhone 14 Pro 128GB" />
                                     </div>
                                </div>
                                <div>
                                     <Label htmlFor="observaciones">Observaciones</Label>
                                     <Textarea id="observaciones" value={cotizacion.observaciones} onChange={(e) => handleCotizacionChange("observaciones", e.target.value)} placeholder="Notas adicionales sobre la cotización o venta" rows={3} />
                                </div>
                                <Button onClick={() => setActiveTab("productos")} className="w-full">
                                    Continuar a Productos
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="productos" className="space-y-6">
                        <Card>
                             <CardHeader>
                                 <CardTitle>Buscar y Agregar Productos</CardTitle>
                                 <div className="relative mt-2">
                                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                     <Input placeholder="Buscar productos por nombre..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} className="pl-10" />
                                 </div>
                             </CardHeader>
                             <CardContent>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                                     {productSearchResults.length > 0 ? productSearchResults.map((producto) => (
                                         <Card key={producto.id} className="transition-all hover:shadow-lg">
                                             <CardContent className="p-4">
                                                 <div className="flex justify-between items-start mb-2">
                                                     <div>
                                                         <p className="font-bold text-lg">{producto.nombre}</p>
                                                         <Badge variant="outline" className="mt-1">{producto.categoria || 'General'}</Badge>
                                                     </div>
                                                     <Badge variant={producto.stock > 10 ? "default" : "destructive"}>ID: {producto.id}</Badge>
                                                 </div>
                                                 <div className="flex justify-between items-center mt-3">
                                                     <p className="text-2xl font-bold text-slate-800">${producto.precio.toFixed(2)}</p>
                                                     <p className="text-sm text-gray-500">Stock: {producto.stock}</p>
                                                 </div>
                                                  <div className="flex items-center gap-2 mt-4">
                                                    <Input type="number" defaultValue={1} min="1" max={producto.stock} className="w-20" id={`cantidad-${producto.id}`}/>
                                                    <Button onClick={() => {
                                                        const cantidadInput = document.getElementById(`cantidad-${producto.id}`) as HTMLInputElement;
                                                        agregarAlCarrito(producto, parseInt(cantidadInput.value) || 1);
                                                    }} className="flex-1">
                                                        <Plus className="w-4 h-4 mr-2" /> Agregar
                                                    </Button>
                                                  </div>
                                             </CardContent>
                                         </Card>
                                     )) : (
                                        <p className="text-muted-foreground col-span-2 text-center py-4">
                                            {productSearchTerm ? "No se encontraron productos." : "Escribe en la barra para buscar productos."}
                                        </p>
                                     )}
                                 </div>
                             </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="carrito" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Carrito de Compras</CardTitle>
                                <CardDescription>Revisa y confirma los productos seleccionados</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {carrito.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground text-lg">El carrito está vacío</p>
                                        <Button onClick={() => setActiveTab("productos")} className="mt-4" variant="outline">
                                            Agregar Productos
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {carrito.map((item) => (
                                            <Card key={item.producto.id} className="border-2">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-center flex-wrap gap-4">
                                                        <div className="flex-1 min-w-[150px]">
                                                            <h4 className="font-bold text-lg">{item.producto.nombre}</h4>
                                                            <p className="text-sm text-muted-foreground">${item.producto.precio.toFixed(2)} c/u</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button size="sm" onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)} variant="outline">
                                                                <Minus className="w-4 h-4" />
                                                            </Button>
                                                            <span className="w-12 text-center font-bold text-lg">{item.cantidad}</span>
                                                            <Button size="sm" onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)} variant="outline">
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                          <p className="font-bold text-xl text-slate-800 w-24 text-right">${item.subtotal.toFixed(2)}</p>
                                                          <Button size="sm" onClick={() => eliminarDelCarrito(item.producto.id)} variant="destructive">
                                                                <Trash2 className="w-4 h-4" />
                                                          </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        <Card className="border-2 border-slate-800 bg-slate-50">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-2xl font-bold">Total:</span>
                                                    <span className="text-3xl font-bold text-slate-900">${calcularTotal()}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Button
                                            onClick={procesarVenta}
                                            disabled={carrito.length === 0 || processingVenta}
                                            className="w-full h-12 text-lg"
                                        >
                                            {processingVenta ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Procesando Venta...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5 mr-2" />
                                                    Procesar Venta (${calcularTotal()})
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}