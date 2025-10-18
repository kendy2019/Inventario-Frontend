"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  Package,
  FileText,
  ShoppingCart,
  Home,
  LogOut,
  User,
  Archive,
  FileBarChart,
  Users,
  Settings,
  BarChart3,
} from "lucide-react"
import { logout, getUserData, canAccessProducts, canAccessSales, canAccessClients, canAccessSettings } from "@/lib/auth"

interface MenuItem {
  title: string
  icon: React.ReactNode
  href?: string
  children?: MenuItem[]
  requiredRole?: string
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <Home className="w-4 h-4" />,
    href: "/dashboard",
  },
  {
    title: "PRODUCTOS",
    icon: <Package className="w-4 h-4" />,
    children: [
      {
        title: "Gestión de Productos",
        icon: <Package className="w-4 h-4" />,
        href: "/productos",
      },
      {
        title: "Guía de Ingreso",
        icon: <FileText className="w-4 h-4" />,
        href: "/guia-ingreso",
      },
      {
        title: "Guía de Salida",
        icon: <Archive className="w-4 h-4" />,
        href: "/guia-salida",
      },
    ],
  },
{
    title: "VENTAS",
    icon: <ShoppingCart className="w-4 h-4" />,
    children: [
      {
        title: "Cotización y Venta",
        icon: <ShoppingCart className="w-4 h-4" />,
        href: "/ventas",
      },
      {
        title: "Reportes de Ventas",
        icon: <BarChart3 className="w-4 h-4" />,
        href: "/reportes-ventas",
        requiredRole: "ADMIN" // <-- AÑADE ESTA LÍNEA
      },
    ],
  },
  {
    title: "CLIENTES",
    icon: <Users className="w-4 h-4" />,
    children: [
      {
        title: "Gestión de Clientes",
        icon: <Users className="w-4 h-4" />,
        href: "/clientes",
      },
      {
        title: "Historial de Compras",
        icon: <FileBarChart className="w-4 h-4" />,
        href: "/historial-clientes",
      },
    ],
  },
  {
    title: "CONFIGURACIÓN",
    icon: <Settings className="w-4 h-4" />,
    children: [
      {
        title: "Usuarios",
        icon: <User className="w-4 h-4" />,
        href: "/usuarios",
      },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["PRODUCTOS", "VENTAS"])
  const pathname = usePathname()
  const { username, rol } = getUserData()

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const handleLogout = () => {
    logout()
  }

  const getRoleBadgeVariant = (role: string | null) => {
    if (!role) return "secondary"
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "default"
      case "EMPLOYEE":
        return "secondary"
      default:
        return "outline"
    }
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.title)
    const isActive = item.href === pathname
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            className={`w-full justify-start text-left font-semibold ${level === 0 ? "text-sm" : "text-xs"} hover:bg-muted/80`}
            onClick={() => toggleExpanded(item.title)}
          >
            {item.icon}
            <span className="ml-2 flex-1">{item.title}</span>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>

          {isExpanded && (
            <div className="ml-4 space-y-1 border-l-2 border-muted pl-2">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link key={item.title} href={item.href || "#"}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start text-left ${level === 0 ? "text-sm font-medium" : "text-xs"} ${level > 0 ? "ml-2" : ""} ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/80"}`}
        >
          {item.icon}
          <span className="ml-2">{item.title}</span>
        </Button>
      </Link>
    )
  }

  const getFilteredMenuItems = (): MenuItem[] => {
    return menuItems.filter((item) => {
      // Dashboard siempre visible
      if (item.title === "Dashboard") return true

      // Filtrar según permisos
      if (item.title === "PRODUCTOS") return canAccessProducts()
      if (item.title === "VENTAS") return canAccessSales()
      if (item.title === "CLIENTES") return canAccessClients()
      if (item.title === "CONFIGURACIÓN") return canAccessSettings()

      return true
    })
  }

  return (
    <div className={`flex flex-col h-full bg-card border-r shadow-sm ${className}`}>
      {/* Header del Sidebar */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <h2 className="text-lg font-bold text-foreground">Sistema ERP</h2>
        <p className="text-xs text-muted-foreground">Gestión Empresarial</p>
      </div>

      <div className="p-4 border-b">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{username || "Usuario"}</p>
                <Badge variant={getRoleBadgeVariant(rol)} className="mt-1 text-xs font-medium">
                  {rol || "Usuario"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">En línea</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {getFilteredMenuItems().map((item) => renderMenuItem(item))}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-4 border-t bg-muted/30">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start text-left bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span className="ml-2 font-medium">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  )
}
