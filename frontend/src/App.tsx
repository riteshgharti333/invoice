import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/TablePage/Dashboard";
import Invoices from "./pages/TablePage/Invoices";
import Quotations from "./pages/TablePage/Quotations";
import Customers from "./pages/TablePage/Customers";
import Services from "./pages/TablePage/Services";
import Categories from "./pages/TablePage/Categories";
import NewInvoice from "./pages/NewPage/NewInvoice";
import UpdateInvoice from "./pages/UpdatePage/UpdateInvoice";
import UpdateQuotation from "./pages/UpdatePage/UpdateQuotation";
import UpdateCustomer from "./pages/UpdatePage/UpdateCustomer";
import UpdateService from "./pages/UpdatePage/UpdateService";
import UpdateCategory from "./pages/UpdatePage/UpdateCategory";
import Profile from "./pages/auth/Profile";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";  
import Payments from "./pages/TablePage/Payments";
import UpdatePayment from "./pages/UpdatePage/UpdatePayment";
import NewQuotation from "./pages/NewPage/NewQuotation";
import Setting from "./pages/auth/Setting"; 

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
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<Setting />} />
          // NEW
          <Route path="/invoice/new-invoice" element={<NewInvoice />} />
          <Route path="/quotation/new-quotation" element={<NewQuotation />} />
          //UPDATE
          <Route path="/invoice/:id" element={<UpdateInvoice />} />
          <Route path="/quotation/:id" element={<UpdateQuotation />} />
          <Route path="/customer/:id" element={<UpdateCustomer />} />
          <Route path="/service/:id" element={<UpdateService />} />
          <Route path="/category/:id" element={<UpdateCategory />} />
          <Route path="/payment/:id" element={<UpdatePayment />} />
          //PROFILE
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </DashboardLayout>
    </div>
  );
}

export default App;
