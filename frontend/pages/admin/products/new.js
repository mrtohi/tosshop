import { useRouter } from "next/router";
import AdminLayout from "../../../components/AdminLayout";
import ProductForm from "../../../components/ProductForm";
import { createProduct, uploadProductImage, uploadProductImages } from "../../../lib/adminApi";

export default function NewProduct() {
  const router = useRouter();

  const handleSubmit = async (data, mainImage, galleryFiles) => {
    const product = await createProduct(data);
    if (mainImage) await uploadProductImage(product.id, mainImage);
    if (galleryFiles?.length) await uploadProductImages(product.id, galleryFiles);
    router.push("/admin/products");
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-extrabold mb-6">محصول جدید</h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="ثبت محصول" onImageSelect />
    </AdminLayout>
  );
}
