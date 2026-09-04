import Link from "next/link"
import type {Product} from "@/lib/api"
import {formatNaira} from "@/lib/format"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"




export function ProductCard ({product}: {product: Product}) {
    const fromVariant = product.variants.reduce((lowest, v) => parseFloat(v.cartonPrice) < parseFloat(lowest.cartonPrice) ? v : lowest, product.variants[0]);



    return (
        <Link href={`/products/${product.id}`} className="group block">
            <Card className="transition hover:border-primary hover:shadow-sm">
                <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2" >
                        {product.brand.name}
                    </Badge>
                    <h3 className="font-semibold text-foreground group-hover:headline">
                        {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-forground">
                        {product.variants.length} option {product.variants.length !== 1 ? "s" : ""} . {product.category.name}
                    </p>
                    {fromVariant && (
                        <p  className="mt-3 text-sm">
                            From{" "}
                            <span className="font-semibold">
                                {formatNaira(fromVariant.cartonPrice)}
                            </span>{" "}
                            <span className="text-muted-foreground">/ carton</span>
                        </p>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}




