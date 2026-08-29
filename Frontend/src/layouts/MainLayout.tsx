import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Breadcrumbs from "@/components/common/Breadcrumb";
import { useVisitorAnalytics } from "@/hooks/useVisitorAnalytics";
function MainLayout() {
    useVisitorAnalytics();
    return (
        <div className = "min-h-screen w-full flex flex-col">
            <ScrollRestoration />
            <Navbar/>
            
            <main className = "flex-1 pt-[100px]">
                <Breadcrumbs/>
                <Outlet/>
            </main>
            <Footer/>
        </div>  
    )
};
export default MainLayout;
