'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateFormId, downloadJSON, downloadCSV } from '@/lib/utils';

const FormContext = createContext(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

export function FormProvider({ children }) {
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [responses, setResponses] = useState({});
  
  // Load forms from localStorage on initial render
  useEffect(() => {
    const savedForms = localStorage.getItem('forms');
    const savedResponses = localStorage.getItem('responses');
    
    if (savedForms) {
      setForms(JSON.parse(savedForms));
    }
    
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, []);
  
  // Save forms to localStorage whenever they change
  useEffect(() => {
    if (forms.length > 0) {
      localStorage.setItem('forms', JSON.stringify(forms));
    }
  }, [forms]);
  
  // Save responses to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem('responses', JSON.stringify(responses));
    }
  }, [responses]);
  
  // Create a new form
  const createForm = (formData) => {
    const newForm = {
      id: generateFormId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...formData,
    };
    
    setForms((prevForms) => [...prevForms, newForm]);
    return newForm.id;
  };
  
  // Update an existing form
  const updateForm = (formId, formData) => {
    setForms((prevForms) => 
      prevForms.map((form) => 
        form.id === formId 
          ? { 
              ...form, 
              ...formData, 
              updatedAt: new Date().toISOString() 
            } 
          : form
      )
    );
  };
  
  // Delete a form
  const deleteForm = (formId) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== formId));
    
    // Also delete associated responses
    const newResponses = { ...responses };
    delete newResponses[formId];
    setResponses(newResponses);
  };
  
  // Get a form by ID
  const getForm = (formId) => {
    return forms.find((form) => form.id === formId) || null;
  };
  
  // Submit a response to a form
  const submitResponse = (formId, responseData) => {
    const responseId = `${formId}_${Date.now()}`;
    const newResponse = {
      id: responseId,
      formId,
      submittedAt: new Date().toISOString(),
      data: responseData,
    };
    
    setResponses((prevResponses) => ({
      ...prevResponses,
      [formId]: [...(prevResponses[formId] || []), newResponse],
    }));
    
    return responseId;
  };
  
  // Get all responses for a form
  const getResponses = (formId) => {
    return responses[formId] || [];
  };
  
  // Export form responses as JSON
  const exportResponsesAsJSON = (formId) => {
    const formResponses = getResponses(formId);
    const form = getForm(formId);
    
    if (formResponses.length === 0 || !form) return;
    
    const filename = `${form.title.replace(/\s+/g, '_')}_responses_${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(formResponses, filename);
  };
  
  // Export form responses as CSV
  const exportResponsesAsCSV = (formId) => {
    const formResponses = getResponses(formId);
    const form = getForm(formId);
    
    if (formResponses.length === 0 || !form) return;
    
    // Transform responses to a flat structure for CSV
    const flatResponses = formResponses.map((response) => {
      const flatResponse = {
        responseId: response.id,
        submittedAt: response.submittedAt,
      };
      
      // Add all form fields to the flat response
      Object.entries(response.data).forEach(([key, value]) => {
        flatResponse[key] = value;
      });
      
      return flatResponse;
    });
    
    const filename = `${form.title.replace(/\s+/g, '_')}_responses_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(flatResponses, filename);
  };
  
  return (
    <FormContext.Provider
      value={{
        forms,
        currentForm,
        setCurrentForm,
        createForm,
        updateForm,
        deleteForm,
        getForm,
        submitResponse,
        getResponses,
        exportResponsesAsJSON,
        exportResponsesAsCSV,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}