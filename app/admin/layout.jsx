import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "ABU Marketplace - Admin",
    description: "ABU Marketplace - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
