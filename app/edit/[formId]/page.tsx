'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormBuilder from '@/components/FormBuilder';
import { useFormContext } from '@/contexts/FormContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const { getForm } = useFormContext();
  const [form, setForm] = useState(null);
  
  const formId = params.formId;
  
  useEffect(() => {
    if (formId) {
      const formData = getForm(formId);
      if (!formData) {
        router.push('/');
        return;
      }
      setForm(formData);
    }
  }, [formId, getForm, router]);
  
  if (!form) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Form: {form.title}</h1>
      </div>
      
      <FormBuilder initialForm={form} />
    </div>
  );
}