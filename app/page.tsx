'use client';

import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Eye, BarChart, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
  const { forms, deleteForm } = useFormContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (formId) => {
    setShowDeleteConfirm(formId);
  };

  const confirmDelete = async (formId) => {
    try {
      setIsDeleting(true);
      await deleteForm(formId);
    } catch (error) {
      console.error("Error deleting form:", error);
      // Optionally show an error toast/notification
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Forms</h1>
        <Link href="/create">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4">No forms yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first form to start collecting responses
          </p>
          <Link href="/create">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-medium mb-2 truncate">{form.title}</h2>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {form.description || 'No description'}
                </p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Created: {formatDate(form.createdAt)}</span>
                  <span>{form.questions.length} questions</span>
                </div>
              </div>
              <div className="bg-muted p-4 flex flex-wrap justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/edit/${form.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/view/${form.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/responses/${form.id}`}>
                    <Button variant="ghost" size="sm">
                      <BarChart className="h-4 w-4 mr-2" />
                      Responses
                    </Button>
                  </Link>
                  {showDeleteConfirm === form.id ? (
                    <div className="flex space-x-1">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => confirmDelete(form.id)}
                        disabled={isDeleting}
                        aria-label={`Confirm delete ${form.title}`}
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelDelete}
                        disabled={isDeleting}
                        aria-label="Cancel delete"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteClick(form.id)}
                      aria-label={`Delete ${form.title}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}