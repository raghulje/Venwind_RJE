import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import AboutUs from "../pages/about/page";
import Products from "../pages/products/page";
import Technology from "../pages/technology/page";
import Sustainability from "../pages/sustainability/page";
import Careers from "../pages/careers/page";
import Contact from "../pages/contact/page";
import InvestorRelations from "../pages/investor-relations/page";
import AdminPage from "../pages/admin/page";
import AdminIndexPage from "../pages/admin/index/page";
import AdminHomePage from "../pages/admin/home/page";
import AdminAboutPage from "../pages/admin/about/page";
import AdminProductsPage from "../pages/admin/products/page";
import AdminTechnologyPage from "../pages/admin/technology/page";
import AdminSustainabilityPage from "../pages/admin/sustainability/page";
import AdminCareersPage from "../pages/admin/careers/page";
import AdminContactPage from "../pages/admin/contact/page";
import AdminInvestorRelationsPage from "../pages/admin/investor-relations/page";
import AdminUsersPage from "../pages/admin/users/page";
import LoginPage from "../pages/login/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about-us",
    element: <AboutUs />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/technology",
    element: <Technology />,
  },
  {
    path: "/sustainability",
    element: <Sustainability />,
  },
  {
    path: "/careers",
    element: <Careers />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/investor-relations",
    element: <InvestorRelations />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: <AdminIndexPage />,
  },
  {
    path: "/admin/home",
    element: <AdminHomePage />,
  },
  {
    path: "/admin/about",
    element: <AdminAboutPage />,
  },
  {
    path: "/admin/products",
    element: <AdminProductsPage />,
  },
  {
    path: "/admin/technology",
    element: <AdminTechnologyPage />,
  },
  {
    path: "/admin/sustainability",
    element: <AdminSustainabilityPage />,
  },
  {
    path: "/admin/careers",
    element: <AdminCareersPage />,
  },
  {
    path: "/admin/contact",
    element: <AdminContactPage />,
  },
  {
    path: "/admin/investor-relations",
    element: <AdminInvestorRelationsPage />,
  },
  {
    path: "/admin/users",
    element: <AdminUsersPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
