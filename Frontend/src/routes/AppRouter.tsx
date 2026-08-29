import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/routes/ProtectedRouter";
import Home from "@/pages/home/HomePage";
import AboutPage from "@/pages/AboutPage";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AdminMainLayout from "@/layouts/AdminMainLayout";
import AccountRegister from "@/pages/auth/AccountRegisterPage";
import AccountVerify from "@/pages/auth/AccountVerifyPage";
import AccountLogin from "@/pages/auth/AccountLoginPage";
import ForgotPassword from "@/pages/auth/ForgotPasswordPage";
import AllCategoriesPage from "@/pages/client/CategoriesPage";
import ListProductsPage from "@/pages/client/ListProductsPage";
import DetailProductPage from "@/pages/client/DetailProductPage/DetailProductPage";
import ResetPassword from "@/pages/auth/ResetPasswordPage";
import ChangePassword from "@/pages/client/ProfilePage/components/ChangePasswordPage";
import EditProductPage from "@/pages/client/DetailProductPage/components/EditProductPage";
import PostProductPage from "@/pages/client/ProfilePage/components/PostProductPage";
import ProfilePage from "@/pages/client/ProfilePage/ProfilePage";
import MyProductsPage from "@/pages/client/ProfilePage/components/MyProductsPage";
import RegisterSellerPage from "@/pages/client/ProfilePage/components/RegisterSellerPage";
import EditProfilePage from "@/pages/client/ProfilePage/components/EditProfilePage";
import {
  DashboardPage,
  CategoryListPage as CategoryList,
  CategoryCreatePage as CategoryCreate,
  CategoryEditPage as CategoryEdit,
  CategoryTrashPage,
  ProductListPage,
  ProductDetailPage,
  ProductTrashPage,
  UserListPage,
  UserDetailPage,
  SellerApplicationPage as BidderFormListPage,
  SellerApplicationDetailPage,
  ProfilePage as AdminProfilePage,
  VisitorAnalyticsPage,
} from "@/pages/admin";
import RateUserPage from "@/pages/client/RateUserPage";
import RateHistoryPage from "@/pages/client/ProfilePage/components/RateHistoryPage";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import WinnerOrderCompletionPage from "@/pages/client/OrderPage/WinnerOrderCompletionPage";
import SellerOrderPage from "@/pages/client/OrderPage/SellerOrderPage";
const routers = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <BreadcrumbProvider>
          <MainLayout />
        </BreadcrumbProvider>
      </AuthProvider>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/categories/:slugid",
        element: <AllCategoriesPage level={2} />,
      },
      {
        path: "/categories",
        element: <AllCategoriesPage level={1} />,
      },
      {
        path: "/products",
        element: <ListProductsPage />,
      },
      {
        path: "/products/search",
        element: <ListProductsPage />,
      },
      {
        path: "product/:slugid",
        element: <DetailProductPage />,
      },
      {
        path: "product/:slugid/edit",
        element: <EditProductPage />,
      },
      {
        path: "products/post",
        element: <PostProductPage />,
      },
      {
        path: "my-products",
        element: <MyProductsPage />,
      },
      {
        path: "register-seller",
        element: <RegisterSellerPage />,
      },
      {
        path: "/profile/:username_id",
        element: <ProfilePage />,
      },
      {
        path: "profile/edit",
        element: <EditProfilePage />,
      },
      {
        path: "profile/change-password",
        element: <ChangePassword />,
      },
      {
        path: "rating/:username_id",
        element: <RateUserPage />,
      },
      {
        path: "/profile/:username_id/rate",
        element: <RateHistoryPage />,
      },
      {
        path: "/winner-order",
        element: <WinnerOrderCompletionPage />,
      },
      {
        path: "/seller-order",
        element: <SellerOrderPage />,
      },
    ],
  },
  {
    path: "/accounts",
    element: <AuthLayout />,
    children: [
      {
        path: "register",
        element: <AccountRegister />,
      },
      {
        path: "verify",
        element: <AccountVerify />,
      },
      {
        path: "login",
        element: <AccountLogin />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },

  {
    path: "/admin",
    element: (
      <AuthProvider>
        <AdminMainLayout />
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "category/list",
        element: <CategoryList />,
      },
      {
        path: "category/create",
        element: <CategoryCreate />,
      },
      {
        path: "category/edit/:id",
        element: <CategoryEdit />,
      },
      {
        path: "category/trash",
        element: <CategoryTrashPage />,
      },
      {
        path: "product/list",
        element: <ProductListPage />,
      },
      {
        path: "product/detail/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "product/trash",
        element: <ProductTrashPage />,
      },
      {
        path: "user/list",
        element: <UserListPage />,
      },
      {
        path: "user/detail/:id",
        element: <UserDetailPage />,
      },
      {
        path: "seller/applications",
        element: <BidderFormListPage />,
      },
      {
        path: "seller/application/detail/:id",
        element: <SellerApplicationDetailPage />,
      },
      {
        path: "visitor-analytics",
        element: <VisitorAnalyticsPage />,
      },
      {
        path: "profile",
        element: <AdminProfilePage />,
      },
    ],
  },
]);

export default routers;
