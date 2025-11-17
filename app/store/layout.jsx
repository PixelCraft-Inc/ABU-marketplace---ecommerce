import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "ABU Marketplace - Store Dashboard",
    description: "ABU Marketplace - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
