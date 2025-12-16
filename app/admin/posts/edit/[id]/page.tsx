import { AdminPostForm } from '../../PostForm';

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <AdminPostForm postId={params.id} />;
}