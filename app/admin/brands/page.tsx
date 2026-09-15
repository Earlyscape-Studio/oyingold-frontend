import { getBrands } from "@/lib/api";
import { NameSlugManager } from "@/components/app/admin/NameSlugManager";




export default async function AdminBrandsPage() {
    const brands = await getBrands();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Brands</h1>
            <NameSlugManager label="Brand" items={brands} resource="brands" />
        </div>
    );
}