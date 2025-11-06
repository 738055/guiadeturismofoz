import { AdminTourForm } from '../../TourForm';

// Página "Editar"
// Passa o ID da rota para o formulário
export default function EditTourPage({ params }: { params: { id: string } }) {
  return <AdminTourForm tourId={params.id} />;
}