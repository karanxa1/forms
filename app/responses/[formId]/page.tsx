'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormResponses from '@/components/FormResponses';
import { useFormContext } from '@/contexts/FormContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function FormResponsesPage() {
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
    <div>
      <div className="container mx-auto py-4 px-4">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </Link>
      </div>
      
      <FormResponses formId={formId} />
    </div>
  );
}