"use client"

import React, { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"


// --- INTERFACES DE DATOS ---
interface ReporteStats {
    totalVentas: number;
    numeroOrdenes: number;
    clientesActivos: number;
    ticketPromedio: number;
}

interface VentaPorDia {
    fecha: string;
    total: number;
}

interface VentaReciente {
    id: number;
    clienteNombre: string;
    total: number;
    fecha: string;
}

// --- HELPERS DE AUTENTICACIÓN ---
const isAuthenticated = (): boolean => {
    try {
        return localStorage.getItem("authToken") !== null;
    } catch (e) {
        return false;
    }
};
export default function ReportesVentasPage() {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ReporteStats | null>(null);
    const [chartData, setChartData] = useState<VentaPorDia[]>([]);
    const [recentSales, setRecentSales] = useState<VentaReciente[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const authenticated = isAuthenticated();
        setIsAuth(authenticated);
        if (authenticated) {
            fetchReportData();
        } else {
            setLoading(false);
            setError("Acceso denegado. Por favor, inicia sesión.");
        }
    }, []);

    const fetchReportData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            const headers = { 'Authorization': `Bearer ${token}` };

            // Realizar todas las peticiones en paralelo
            const [statsRes, chartRes, recentSalesRes] = await Promise.all([
                fetch('http://localhost:8080/api/reportes/stats', { headers }),
                fetch('http://localhost:8080/api/reportes/ventas-por-dia', { headers }),
                fetch('http://localhost:8080/api/ventas/recientes', { headers })
            ]);

            if (!statsRes.ok || !chartRes.ok || !recentSalesRes.ok) {
                throw new Error('Error al cargar los datos de reportes.');
            }

            const statsData = await statsRes.json();
            const chartData = await chartRes.json();
            const recentSalesData = await recentSalesRes.json();
            
            setStats(statsData);
            setChartData(chartData);
            setRecentSales(recentSalesData);

        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar los datos del reporte. Verifica la conexión con la API.");
        } finally {
            setLoading(false);
        }
    };
    
    // Formateador de moneda
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }
    
    if (error) {
         return (
             <div className="min-h-screen flex items-center justify-center text-center p-4">
                 <div className="p-8 border rounded-lg shadow-lg bg-white">
                     <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                     <p className="text-gray-700">{error}</p>
                 </div>
             </div>
         );
    }

    const statCards = [
        { title: "Ventas Totales", value: stats ? formatCurrency(stats.totalVentas) : 'S/ 0.00', icon: DollarSign },
        { title: "Órdenes", value: stats ? stats.numeroOrdenes : '0', icon: ShoppingCart },
        { title: "Clientes Activos", value: stats ? stats.clientesActivos : '0', icon: Users },
        { title: "Ticket Promedio", value: stats ? formatCurrency(stats.ticketPromedio) : 'S/ 0.00', icon: TrendingUp },
    ];

    return (

      
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Reportes de Ventas</h1>
                    <p className="text-muted-foreground">Análisis y estadísticas clave del negocio</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">Datos actualizados</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Ventas por Día</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="fecha" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Total']} />
                                        <Legend />
                                        <Line type="monotone" dataKey="total" stroke="#18181b" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ventas Recientes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {recentSales.length > 0 ? recentSales.map(sale => (
                               <div key={sale.id} className="flex items-center justify-between">
                                   <div>
                                       <p className="font-medium">{sale.clienteNombre}</p>
                                       <p className="text-sm text-muted-foreground">{new Date(sale.fecha).toLocaleDateString()}</p>
                                   </div>
                                   <div className="font-bold text-right">{formatCurrency(sale.total)}</div>
                               </div>
                           )) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No hay ventas recientes.</p>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
