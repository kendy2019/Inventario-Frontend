"use client"

import React, { useEffect, useState } from "react"
import { FileText, ArrowLeft, LogOut, Save, RotateCcw } from "lucide-react"
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
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }: { children: React.ReactNode, onClick?: () => void, variant?: string, size?: string, className?: string, disabled?: boolean, [key: string]: any }) => {
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
const Alert = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative w-full rounded-lg border p-4 ${className}`}>{children}</div>
)
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
        // Se elimina la redirección que causa error en el entorno de ejecución
        // window.location.href = "/"; 
        window.location.reload(); // Recargar la página para reflejar el estado de logout
    }
};

// Estado inicial del formulario
const initialFormData = {
    nombre: "",
    descripcion: "",
    categoria: "",
    marca: "",
    modelo: "",
    precio: "",
    stock: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    codigoBarras: "",
    notas: "",
};

export default function GuiaIngresoPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)
      setLoading(false)
      
      // La redirección se elimina para evitar el error de URL inválida.
      // El renderizado condicional se encargará de mostrar el contenido correcto.
      // if (!authenticated) {
      //   window.location.href = "/"
      // }
    }
    checkAuth()
  }, [])

  const handleLogout = () => {
    logout()
  }

  const handleInputChange = (field: keyof typeof initialFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    // Conversión de tipos para la API
    const payload = {
        ...formData,
        precio: parseFloat(formData.precio) || 0,
        stock: parseInt(formData.stock, 10) || 0,
    };

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error en el servidor.' }));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      setMessage("Producto ingresado exitosamente")
      setFormData(initialFormData) // Limpiar formulario

    } catch (error: any) {
      setMessage(`Error al ingresar el producto: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setMessage("")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
          
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Guía de Ingreso
              </h1>
            </div>

            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Producto</CardTitle>
            <p className="text-gray-500">
              Completa la información del producto que deseas ingresar al inventario
            </p>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert
                className={`mb-6 ${message.includes("Error") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
              >
                <AlertDescription className={message.includes("Error") ? "text-red-800" : "text-green-800"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Producto *</Label>
                  <Input id="nombre" value={formData.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("nombre", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Input id="categoria" value={formData.categoria} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("categoria", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" value={formData.marca} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("marca", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" value={formData.modelo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("modelo", e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" value={formData.descripcion} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("descripcion", e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="precio">Precio *</Label>
                  <Input id="precio" type="number" step="0.01" value={formData.precio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("precio", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Inicial *</Label>
                  <Input id="stock" type="number" value={formData.stock} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("stock", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="codigoBarras">Código de Barras</Label>
                  <Input id="codigoBarras" value={formData.codigoBarras} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("codigoBarras", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                  <Input id="fechaIngreso" type="date" value={formData.fechaIngreso} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("fechaIngreso", e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea id="notas" value={formData.notas} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("notas", e.target.value)} rows={3} placeholder="Información adicional sobre el producto..." />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Producto
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpiar Formulario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
    </DashboardLayout>
  )
}

