import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../../components/AdminLayout";
import ProductForm from "../../../../components/ProductForm";
import { getAdminProducts, updateProduct, uploadProductImage, uploadProductImages } from "../../../../lib/adminApi";

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) return;
    getAdminProducts().then((all) => setProduct(all.find((p) => String(p.id) === String(id))));
  }, [id]);

  const handleSubmit = async (data, mainImage, galleryFiles) => {
    await updateProduct(id, data);
    if (mainImage) await uploadProductImage(id, mainImage);
    if (galleryFiles?.length) await uploadProductImages(id, galleryFiles);
    router.push("/admin/products");
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-extrabold mb-6">ویرایش محصول</h1>
      {product ? (
        <ProductForm initial={product} onSubmit={handleSubmit} submitLabel="ذخیره تغییرات" onImageSelect />
      ) : (
        <div className="text-[#7C8B88]">در حال بارگذاری...</div>
      )}
    </AdminLayout>
  );
}
