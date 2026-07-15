import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/TablePage/Dashboard";
import Invoices from "./pages/TablePage/Invoices";
import Quotations from "./pages/TablePage/Quotations";
import Customers from "./pages/TablePage/Customers";
import Services from "./pages/TablePage/Services";
import Categories from "./pages/TablePage/Categories";
import NewCustomer from "./pages/NewPage/NewCustomer";
import NewService from "./pages/NewPage/NewService";
import NewCategory from "./pages/NewPage/NewCategory";
import NewInvoice from "./pages/NewPage/NewInvoice";
import UpdateInvoice from "./pages/UpdatePage/UpdateInvoice";
import UpdateQuotation from "./pages/UpdatePage/UpdateQuotation";
import UpdateCustomer from "./pages/UpdatePage/UpdateCustomer";
import UpdateService from "./pages/UpdatePage/UpdateService";
import UpdateCategory from "./pages/UpdatePage/UpdateCategory";
import Profile from "./pages/auth/Profile";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="">
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/categories" element={<Categories />} />
          // NEW
          <Route path="/customer/new-customer" element={<NewCustomer />} />
          <Route path="/services/new-service" element={<NewService />} />
          <Route path="/category/new-category" element={<NewCategory />} />
          <Route path="/invoice/new-invoice" element={<NewInvoice />} />
          <Route path="/quotation/new-quotation" element={<NewInvoice />} />
          //UPDATE
          <Route path="/invoice/:id" element={<UpdateInvoice />} />
          <Route path="/quotation/:id" element={<UpdateQuotation />} />
          <Route path="/customer/:id" element={<UpdateCustomer />} />
          <Route path="/service/:id" element={<UpdateService />} />
          <Route path="/category/:id" element={<UpdateCategory />} />
          //PROFILE
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </DashboardLayout>
    </div>
  );
}

export default App;
