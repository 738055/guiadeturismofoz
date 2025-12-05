// guiadeturismofoz/app/admin/categories/edit/[id]/page.tsx
import { CategoryForm } from '../../CategoryForm';

// Página "Editar Categoria"
export default function EditCategoryPage({ params }: { params: { id: string } }) {
  return <CategoryForm categoryId={params.id} />;
}