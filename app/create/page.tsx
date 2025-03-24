'use client';

import React from 'react';
import FormBuilder from '@/components/FormBuilder';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateFormPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Form</h1>
      </div>
      
      <FormBuilder />
    </div>
  );
}