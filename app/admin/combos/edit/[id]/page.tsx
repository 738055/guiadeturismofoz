'use client';

import React from 'react';
import { AdminComboForm } from '../../ComboForm';

export default function EditComboPage({ params }: { params: { id: string } }) {
  return <AdminComboForm comboId={params.id} />;
}