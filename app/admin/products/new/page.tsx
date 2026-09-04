import {getCategories, getBrands} from "@/lib/api";
import {NewProductForm} from "@/components/app/NewProductForm";
import {RequireAdminSession} from "@/components/app/RequireAdminSession";



export default async function NewProductPage () {
    const [categories, brands] = await Promise.all([
        getCategories(),
        getBrands()
    ])

    return(
        <RequireAdminSession>
            <div className="mx-auto max-w-2xl px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900">Add product</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Add a new product and its first size/unit option.
                </p>

                <div className="mt-6">
                    <NewProductForm categories={categories} brands={brands} />
                </div>
            </div>
        </RequireAdminSession>
    )
}