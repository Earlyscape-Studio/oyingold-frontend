import {getCategories, createCategory, updateCategory, deleteCategory} from "@/lib/api";
import {NameSlugManager} from "@/components/app/admin/NameSlugManager";


export default async function AdminCategoriesPage(){
    const categories = await getCategories();


    return(
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Categories</h1>
            <NameSlugManager
                label="Category"
                items={categories}
                actions={{
                    create: createCategory,
                    update: updateCategory,
                    remove: deleteCategory
                }}
            />
        </div>
    );
}

