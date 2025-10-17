"use client"

import React, { useEffect, useState } from "react"
import { Package, Search, Edit, Trash2, Plus, ArrowLeft, LogOut } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

// --- Componentes de UI simulados ---
// Se recrean los componentes de UI para eliminar las dependencias externas.
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
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }: { children: React.ReactNode, onClick?: () => void, variant?: string, size?: string, className?: string, [key: string]: any }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const sizeClasses = size === 'sm' ? 'h-9 px-3' : 'h-10 py-2 px-4';
  const variantClasses = variant === 'outline'
    ? 'border border-input hover:bg-accent hover:text-accent-foreground'
    : 'bg-primary text-primary-foreground hover:bg-primary/90';
  return (
    <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
const Input = ({ className, ...props }: { className?: string, [key: string]: any }) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
)
const Label = ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>{children}</label>
)

const Alert = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => {
    const variantClasses = variant === 'destructive' 
        ? 'border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500'
        : 'border-blue-500/50 text-blue-500 dark:border-blue-500 [&>svg]:text-blue-500';
    return <div className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 ${variantClasses} ${className}`}>{children}</div>
}
const AlertDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</div>
)

// --- Funciones de autenticación simuladas ---
const isAuthenticated = () => typeof window !== 'undefined' && !!localStorage.getItem('authToken');
const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        window.location.href = "/"; // Redirige a la página de inicio
    }
};

// Interfaz actualizada para coincidir con la entidad completa de Spring Boot
interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  marca?: string
  modelo?: string
  fechaIngreso?: string
  codigoBarras?: string
  notas?: string
}

// URL base de tu API de Spring Boot
const API_URL = "http://localhost:8080/api/productos";

export default function ProductosPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "",
  })
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)
      setLoading(false)

      if (!authenticated) {
        // En un entorno real, esto podría redirigir a una página de login.
        // Por ahora, solo evitamos cargar datos si no está autenticado.
        console.log("Usuario no autenticado.");
      } else {
        await loadProductos()
      }
    }

    checkAuthAndLoadData()
  }, [])

  // --- Funciones de API ---

  const loadProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 403) {
        setError("Acceso denegado. Tu sesión puede haber expirado.");
        logout();
        return;
      }
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: No se pudieron cargar los productos.`);
      }
      const data = await response.json();
      setProductos(data);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error de red.");
      console.error(err);
    } finally {
        setLoading(false);
    }
  }

  const handleAddProduct = async () => {
    setError(null);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newProduct)
        });

        if (!response.ok) {
            throw new Error('Error al agregar el producto.');
        }

        setNewProduct({ nombre: "", descripcion: "", precio: 0, stock: 0, categoria: "" });
        setShowAddForm(false);
        await loadProductos();
    } catch (err: any) {
        setError(err.message || "No se pudo crear el producto.");
        console.error(err);
    }
  }

  const handleEditProduct = async (producto: Producto) => {
    if (!producto) return;
    setError(null);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/${producto.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(producto)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el producto.');
        }

        setEditingProduct(null);
        await loadProductos();
    } catch (err: any) {
        setError(err.message || "No se pudo actualizar el producto.");
        console.error(err);
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto.');
            }
            await loadProductos();
        } catch (err: any) {
            setError(err.message || "No se pudo eliminar el producto.");
            console.error(err);
        }
    }
  }

  // --- Renderizado ---

  const handleLogout = () => {
    logout()
  }

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading && !isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
                <p>Por favor, inicia sesión para acceder a esta página.</p>
            </div>
        </div>
    )
  }

  return (

  <DashboardLayout>
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <style>{`
        :root {
          --primary: 222.2 47.4% 11.2%;
          --primary-foreground: 210 40% 98%;
        }
        .bg-primary { background-color: hsl(var(--primary)); }
        .text-primary-foreground { color: hsl(var(--primary-foreground)); }
        .hover\\:bg-primary\\/90:hover { background-color: hsl(222.2 47.4% 11.2% / 0.9); }
      `}</style>
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Gestión de Productos
              </h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          {error && (
              <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newProduct.nombre}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <Input
                      id="categoria"
                      value={newProduct.categoria}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                      id="precio"
                      type="number"
                      value={newProduct.precio}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({ ...newProduct, precio: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={newProduct.descripcion}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddProduct}>Guardar</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && <div className="text-center p-4">Cargando productos...</div>}

          {!loading && <div className="grid gap-4">
            {filteredProductos.map((producto) => (
              <Card key={producto.id}>
                <CardContent className="p-6">
                  {editingProduct?.id === producto.id ? (
                    <div className="space-y-4">
                      {/* Formulario de Edición */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Nombre</Label><Input value={editingProduct.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({ ...editingProduct, nombre: e.target.value })}/></div>
                        <div><Label>Categoría</Label><Input value={editingProduct.categoria} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({ ...editingProduct, categoria: e.target.value })}/></div>
                        <div><Label>Precio</Label><Input type="number" value={editingProduct.precio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({ ...editingProduct, precio: Number(e.target.value) })}/></div>
                        <div><Label>Stock</Label><Input type="number" value={editingProduct.stock} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}/></div>
                      </div>
                      <div><Label>Descripción</Label><Input value={editingProduct.descripcion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({ ...editingProduct, descripcion: e.target.value })}/></div>
                      <div className="flex gap-2"><Button onClick={() => handleEditProduct(editingProduct)}>Guardar</Button><Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button></div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      {/* Vista de Producto */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                        <p className="text-gray-500">{producto.descripcion}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{producto.categoria}</span>
                          <span className="font-medium text-gray-800">${producto.precio}</span>
                          <span className={`${producto.stock > 10 ? "text-green-600" : producto.stock > 0 ? "text-yellow-600" : "text-red-600"}`}>Stock: {producto.stock}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingProduct(producto)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(producto.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>}

          {!loading && filteredProductos.length === 0 && (
            <Alert>
              <AlertDescription>No se encontraron productos que coincidan con tu búsqueda.</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  </DashboardLayout>
  )
}