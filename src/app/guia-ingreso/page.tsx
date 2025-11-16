"use client"

import React, { useEffect, useState, useCallback } from "react"
import { FileText, LogOut, Save, RotateCcw, Search, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

// (UI components: mismos simulados que tenías - los copio brevemente)
const Card = ({ children, className }: any) => <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>{children}</div>
const CardHeader = ({ children, className }: any) => <div className={`p-6 border-b ${className}`}>{children}</div>
const CardTitle = ({ children, className }: any) => <h2 className={`text-xl font-semibold tracking-tight ${className}`}>{children}</h2>
const CardContent = ({ children, className }: any) => <div className={`p-6 ${className}`}>{children}</div>
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }: any) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
  const sizeClasses = size === 'sm' ? 'h-9 px-3' : 'h-10 py-2 px-4';
  const variantClasses = variant === 'outline' ? 'border border-input bg-transparent hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  return <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`} onClick={onClick} disabled={disabled} {...props}>{children}</button>
}
const Input = ({ className, ...props }: any) => <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
const Textarea = ({ className, ...props }: any) => <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
const Label = ({ children, ...props }: any) => <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>{children}</label>
const Alert = ({ children, className }: any) => <div className={`relative w-full rounded-lg border p-4 ${className}`}>{children}</div>
const AlertDescription = ({ children, className }: any) => <div className={`text-sm ${className}`}>{children}</div>

// auth helpers
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
  precio?: number;
}

interface ProductoEnGuia extends Producto {
  cantidad: number;
}

const initialForm = {
  fechaIngreso: new Date().toISOString().split("T")[0],
  notas: ""
}

export default function GuiaIngresoPage() {
  const [loading, setLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Producto[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [productosEnGuia, setProductosEnGuia] = useState<ProductoEnGuia[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success'|'error', text: string }|null>(null)

  useEffect(() => {
    const auth = isAuthenticated()
    setIsAuth(auth)
    setLoading(false)
  }, [])

  // búsqueda con debounce
  const buscarProductos = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`http://localhost:8080/api/productos/buscar?nombre=${encodeURIComponent(term)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Error buscando productos")
      const data = await res.json()
      setSearchResults(data)
    } catch (e) {
      console.error(e)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => buscarProductos(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm, buscarProductos])

  const addProducto = (p: Producto) => {
    if (!productosEnGuia.some(x => x.id === p.id)) {
      setProductosEnGuia(prev => [...prev, { ...p, cantidad: 1 }])
    }
    setSearchTerm("")
    setSearchResults([])
  }

  const removeProducto = (id: number) => setProductosEnGuia(prev => prev.filter(p => p.id !== id))

  const cambiarCantidad = (id: number, cantidad: number) => {
    if (cantidad < 1) cantidad = 1
    setProductosEnGuia(prev => prev.map(p => p.id === id ? { ...p, cantidad } : p))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (productosEnGuia.length === 0) {
      setMessage({ type: 'error', text: 'Agrega al menos un producto antes de enviar la guía.' })
      return
    }
    setSaving(true)
    setMessage(null)

    const payload = {
      fechaIngreso: form.fechaIngreso,
      notas: form.notas,
      detalle: productosEnGuia.map(p => ({ productoId: p.id, cantidad: p.cantidad }))
    }

    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch('http://localhost:8080/api/guias-ingreso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error del servidor' }))
        throw new Error(err.message || 'Error al registrar guía.')
      }
      setMessage({ type: 'success', text: 'Guía de ingreso registrada correctamente.' })
      setForm(initialForm)
      setProductosEnGuia([])
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(initialForm)
    setProductosEnGuia([])
    setMessage(null)
    setSearchTerm("")
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Verificando...</div>
  if (!isAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Por favor inicia sesión.</p>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6" /> Guía de Ingreso
            </h1>
            <Button onClick={logout} variant="outline" size="sm"><LogOut className="w-4 h-4 mr-2"/> Cerrar Sesión</Button>
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
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                  <Input id="fechaIngreso" type="date" value={form.fechaIngreso} onChange={(e:any) => setForm(prev => ({...prev, fechaIngreso: e.target.value}))} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea id="notas" value={form.notas} onChange={(e:any) => setForm(prev => ({...prev, notas: e.target.value}))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos en la Guía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Label htmlFor="buscarProducto">Buscar Producto</Label>
                  <div className="flex items-center">
                    <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                    <Input id="buscarProducto" placeholder="Escribe para buscar..." value={searchTerm} onChange={(e:any) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                  {isSearching && <p className="text-sm text-gray-500 mt-1">Buscando...</p>}
                  {searchResults.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {searchResults.map(p => (
                        <li key={p.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => addProducto(p)}>
                          {p.nombre} (Stock: {p.stock})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  {productosEnGuia.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">No hay productos agregados.</p>
                  ) : (
                    <div className="space-y-2">
                      {productosEnGuia.map(p => (
                        <div key={p.id} className="flex items-center gap-4 p-2 border rounded-md">
                          <div className="flex-grow">
                            <p className="font-medium">{p.nombre}</p>
                            <p className="text-sm text-gray-500">Stock actual: {p.stock}</p>
                          </div>

                          <Input type="number" className="w-24" min={1} value={p.cantidad} onChange={(e:any) => cambiarCantidad(p.id, parseInt(e.target.value || "1", 10))} />
                          <Button variant="outline" size="sm" onClick={() => removeProducto(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {message && (
              <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2"/> Limpiar</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <>Guardando...</> : <><Save className="w-4 h-4 mr-2"/> Guardar Guía</>}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </DashboardLayout>
  )
}
