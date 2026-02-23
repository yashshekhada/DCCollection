
import { useAuth } from "@/contexts/AuthProvider";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, LogOut, PlusCircle, Tags, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
                <div className="p-6 flex justify-center">
                    <img src="/logo.png" alt="Deep Collection" className="h-20 w-auto object-contain" />
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link
                        to="/admin/products"
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive("/admin/products")
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <Package className="mr-2 h-5 w-5" />
                        Products
                    </Link>
                    <Link
                        to="/admin/products/new"
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive("/admin/products/new")
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add Product
                    </Link>
                    <Link
                        to="/admin/categories"
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive("/admin/categories")
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <Tags className="mr-2 h-5 w-5" />
                        Categories
                    </Link>
                    <Link
                        to="/admin/banners"
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive("/admin/banners")
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Banners
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">{user.username}</span>
                    </div>
                    <Button variant="outline" className="w-full justify-start" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile Header (TODO) */}

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
