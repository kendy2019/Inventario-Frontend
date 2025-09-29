"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronDown,
  ChevronRight,
  Package,
  FileText,
  ShoppingCart,
  Receipt,
  Home,
  LogOut,
  User,
  TrendingUp,
  Archive,
} from "lucide-react"
import { logout, getUsername, getUserRole } from "@/lib/auth"

interface MenuItem {
  title: string
  icon: React.ReactNode
  href?: string
  children?: MenuItem[]
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
        title: "Sistema de Ventas",
        icon: <ShoppingCart className="w-4 h-4" />,
        href: "/ventas",
      },
      {
        title: "Venta Producto Cliente",
        icon: <Receipt className="w-4 h-4" />,
        href: "/venta-producto-cliente",
      },
      {
        title: "Reportes de Ventas",
        icon: <TrendingUp className="w-4 h-4" />,
        href: "/reportes-ventas",
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
  const username = getUsername()
  const userRole = getUserRole()


  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const handleLogout = () => {
    logout()
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
            className={`w-full justify-start text-left font-medium ${level === 0 ? "text-sm" : "text-xs"}`}
            onClick={() => toggleExpanded(item.title)}
          >
            {item.icon}
            <span className="ml-2 flex-1">{item.title}</span>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>

          {isExpanded && item.children && (
            <div className="ml-4 space-y-1">{item.children.map((child) => renderMenuItem(child, level + 1))}</div>
          )}
        </div>
      )
    }

    return (
      <Link key={item.title} href={item.href || "#"}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start text-left ${level === 0 ? "text-sm" : "text-xs"} ${level > 0 ? "ml-2" : ""}`}
        >
          {item.icon}
          <span className="ml-2">{item.title}</span>
        </Button>
      </Link>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-card border-r ${className}`}>
      {/* Header del Sidebar */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Sistema de Gestión</h2>
      </div>

      {/* Información del Usuario */}
      <div className="p-4 border-b">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{username || "Usuario"}</p>
                <p className="text-xs text-muted-foreground truncate">{userRole || "Rol Desconocido"}</p>
                <p className="text-xs text-muted-foreground">Conectado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2">{menuItems.map((item) => renderMenuItem(item))}</nav>

      {/* Footer del Sidebar */}
      <div className="p-4 border-t">
        <Button onClick={handleLogout} variant="outline" className="w-full justify-start text-left bg-transparent">
          <LogOut className="w-4 h-4" />
          <span className="ml-2">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  )
}
