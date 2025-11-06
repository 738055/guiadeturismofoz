import React from 'react';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { BookOpen } from 'lucide-react';

export default async function BlogPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh]">
       <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-verde-principal mb-4 font-serif">{dict.blog.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{dict.blog.subtitle}</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">{dict.blog.noPosts}</p>
      </div>
    </div>
  );
}