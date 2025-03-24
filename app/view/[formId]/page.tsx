'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormViewer from '@/components/FormViewer';
import { useFormContext } from '@/contexts/FormContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ViewFormPage() {
  const params = useParams();
  const router = useRouter();
  const { getForm } = useFormContext();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const formId = params.formId;
  
  useEffect(() => {
    if (formId) {
      try {
        const formData = getForm(formId);
        if (!formData) {
          router.push('/');
          return;
        }
        setForm(formData);
      } catch (error) {
        console.error("Error loading form:", error);
        // Optionally redirect or show error message
      } finally {
        setLoading(false);
      }
    }
  }, [formId, getForm, router]);
  
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  if (!form) {
    return <div className="p-8 text-center">Form not found or unable to load.</div>;
  }
  
  return (
    <div>
      <div className="container mx-auto py-4 px-4">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </Link>
      </div>
      
      <FormViewer formId={formId} />
    </div>
  );
}