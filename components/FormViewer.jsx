'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatDate } from '@/lib/utils';

const FormViewer = ({ formId }) => {
  const { getForm, submitResponse } = useFormContext();
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const form = getForm(formId);
  
  if (!form) {
    return <div className="p-8 text-center">Form not found</div>;
  }
  
  // Create a dynamic schema based on form questions
  const createFormSchema = () => {
    const schema = {};
    
    form.questions.forEach((question) => {
      if (question.required) {
        switch (question.type) {
          case 'email':
            schema[question.id] = z.string().email('Please enter a valid email address');
            break;
          case 'number':
            schema[question.id] = z.string().refine((val) => !isNaN(val), {
              message: 'Please enter a valid number',
            });
            break;
          case 'phone':
            schema[question.id] = z.string().min(10, 'Phone number must be at least 10 digits');
            break;
          case 'multiple_choice':
          case 'dropdown':
            schema[question.id] = z.string().min(1, 'Please select an option');
            break;
          case 'checkbox':
            schema[question.id] = z.array(z.string()).min(1, 'Please select at least one option');
            break;
          default:
            schema[question.id] = z.string().min(1, 'This field is required');
        }
      } else {
        switch (question.type) {
          case 'email':
            schema[question.id] = z.string().email('Please enter a valid email address').optional();
            break;
          case 'number':
            schema[question.id] = z.string().refine((val) => !val || !isNaN(val), {
              message: 'Please enter a valid number',
            }).optional();
            break;
          case 'checkbox':
            schema[question.id] = z.array(z.string()).optional();
            break;
          default:
            schema[question.id] = z.string().optional();
        }
      }
    });
    
    return z.object(schema);
  };
  
  const formSchema = createFormSchema();
  
  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: form.questions.reduce((acc, question) => {
      if (question.type === 'checkbox') {
        acc[question.id] = [];
      } else {
        acc[question.id] = '';
      }
      return acc;
    }, {}),
  });
  
  const onSubmit = (data) => {
    submitResponse(formId, data);
    setSubmitted(true);
  };
  
  const totalSteps = form.settings.showProgressBar ? Math.ceil(form.questions.length / 5) : 1;
  
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const renderQuestionByType = (question, index) => {
    const isCurrentStep = form.settings.showProgressBar 
      ? Math.floor(index / 5) === currentStep
      : true;
    
    if (!isCurrentStep) return null;
    
    const errorMessage = errors[question.id]?.message;
    
    return (
      <div key={question.id} className="mb-6">
        <div className="mb-2">
          <Label htmlFor={question.id} className="text-base font-medium">
            {question.title}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
        
        {question.type === 'short_text' && (
          <Input
            id={question.id}
            {...register(question.id)}
            placeholder="Your answer"
          />
        )}
        
        {question.type === 'long_text' && (
          <Textarea
            id={question.id}
            {...register(question.id)}
            placeholder="Your answer"
            rows={4}
          />
        )}
        
        {question.type === 'multiple_choice' && (
          <RadioGroup
            onValueChange={(value) => setValue(question.id, value)}
            defaultValue={watch(question.id)}
          >
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  id={`${question.id}-${option.id}`}
                  value={option.value}
                />
                <Label htmlFor={`${question.id}-${option.id}`}>{option.value}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {question.type === 'checkbox' && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option.id}`}
                  value={option.value}
                  onCheckedChange={(checked) => {
                    const currentValues = watch(question.id) || [];
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((value) => value !== option.value);
                    setValue(question.id, newValues);
                  }}
                />
                <Label htmlFor={`${question.id}-${option.id}`}>{option.value}</Label>
              </div>
            ))}
          </div>
        )}
        
        {question.type === 'dropdown' && (
          <Select
            onValueChange={(value) => setValue(question.id, value)}
            defaultValue={watch(question.id)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {question.type === 'date' && (
          <Input
            id={question.id}
            type="date"
            {...register(question.id)}
          />
        )}
        
        {question.type === 'number' && (
          <Input
            id={question.id}
            type="number"
            {...register(question.id)}
            placeholder="Your answer"
          />
        )}
        
        {question.type === 'email' && (
          <Input
            id={question.id}
            type="email"
            {...register(question.id)}
            placeholder="Your email"
          />
        )}
        
        {question.type === 'phone' && (
          <Input
            id={question.id}
            type="tel"
            {...register(question.id)}
            placeholder="Your phone number"
          />
        )}
        
        {errorMessage && (
          <p className="text-sm text-destructive mt-1">{errorMessage}</p>
        )}
      </div>
    );
  };
  
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Thank you for your response!</h2>
          <p className="mb-6">Your response has been recorded.</p>
          <Button onClick={() => setSubmitted(false)}>Submit another response</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-muted-foreground mb-6">{form.description}</p>
        )}
        
        {form.settings.showProgressBar && totalSteps > 1 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {form.questions.map(renderQuestionByType)}
          
          <div className="flex justify-between mt-8">
            {form.settings.showProgressBar && totalSteps > 1 && (
              <>
                {currentStep > 0 ? (
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < totalSteps - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit">Submit</Button>
                )}
              </>
            )}
            
            {(!form.settings.showProgressBar || totalSteps === 1) && (
              <Button type="submit" className="ml-auto">
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormViewer;