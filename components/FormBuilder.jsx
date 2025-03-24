'use client';

import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusCircle, Trash2, MoveUp, MoveDown, Copy } from 'lucide-react';

const QUESTION_TYPES = [
  { id: 'short_text', label: 'Short Text' },
  { id: 'long_text', label: 'Long Text' },
  { id: 'multiple_choice', label: 'Multiple Choice' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'dropdown', label: 'Dropdown' },
  { id: 'date', label: 'Date' },
  { id: 'number', label: 'Number' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
];

const FormBuilder = ({ initialForm = null }) => {
  const { createForm, updateForm } = useFormContext();
  
  const [formState, setFormState] = useState(initialForm || {
    title: '',
    description: '',
    questions: [],
    settings: {
      collectEmail: false,
      isPublic: true,
      allowMultipleResponses: false,
      showProgressBar: true,
      shuffleQuestions: false,
      theme: 'default',
    },
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  
  const handleFormChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSettingsChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };
  
  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type: 'short_text',
      title: 'New Question',
      required: false,
      options: [],
    };
    
    setFormState(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    
    setCurrentQuestionIndex(formState.questions.length);
  };
  
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...formState.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    
    setFormState(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };
  
  const removeQuestion = (index) => {
    const updatedQuestions = formState.questions.filter((_, i) => i !== index);
    
    setFormState(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
    
    if (currentQuestionIndex === index) {
      setCurrentQuestionIndex(null);
    } else if (currentQuestionIndex > index) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const moveQuestion = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formState.questions.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedQuestions = [...formState.questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = 
      [updatedQuestions[newIndex], updatedQuestions[index]];
    
    setFormState(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
    
    setCurrentQuestionIndex(newIndex);
  };
  
  const duplicateQuestion = (index) => {
    const questionToDuplicate = { ...formState.questions[index] };
    questionToDuplicate.id = `q_${Date.now()}`;
    
    const updatedQuestions = [...formState.questions];
    updatedQuestions.splice(index + 1, 0, questionToDuplicate);
    
    setFormState(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };
  
  const addOption = (questionIndex) => {
    const updatedQuestions = [...formState.questions];
    const question = updatedQuestions[questionIndex];
    
    if (!question.options) {
      question.options = [];
    }
    
    question.options.push({
      id: `opt_${Date.now()}`,
      value: `Option ${question.options.length + 1}`,
    });
    
    setFormState(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };
  
  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formState.questions];
    updatedQuestions[questionIndex].options[optionIndex].value = value;
    
    setFormState(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };
  
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formState.questions];
    updatedQuestions[questionIndex].options = 
      updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    
    setFormState(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };
  
  const saveForm = () => {
    if (!formState.title.trim()) {
      alert('Please add a title to your form');
      return;
    }
    
    if (initialForm?.id) {
      updateForm(initialForm.id, formState);
      window.location.href = '/';
    } else {
      const formId = createForm(formState);
      window.location.href = '/';
    }
  };
  
  const renderQuestionEditor = () => {
    if (currentQuestionIndex === null || !formState.questions[currentQuestionIndex]) {
      return null;
    }
    
    const question = formState.questions[currentQuestionIndex];
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Edit Question</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="question-title">Question Text</Label>
            <Input
              id="question-title"
              value={question.title}
              onChange={(e) => updateQuestion(currentQuestionIndex, 'title', e.target.value)}
              placeholder="Enter your question"
            />
          </div>
          
          <div>
            <Label htmlFor="question-type">Question Type</Label>
            <Select
              value={question.type}
              onValueChange={(value) => updateQuestion(currentQuestionIndex, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="question-required"
              checked={question.required}
              onCheckedChange={(checked) => 
                updateQuestion(currentQuestionIndex, 'required', checked)
              }
            />
            <Label htmlFor="question-required">Required</Label>
          </div>
          
          {['multiple_choice', 'checkbox', 'dropdown'].includes(question.type) && (
            <div className="space-y-2">
              <Label>Options</Label>
              {question.options?.map((option, optionIndex) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Input
                    value={option.value}
                    onChange={(e) => 
                      updateOption(currentQuestionIndex, optionIndex, e.target.value)
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(currentQuestionIndex, optionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOption(currentQuestionIndex)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <div>
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  value={formState.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Enter form title"
                  className="text-xl font-medium"
                />
              </div>
              
              <div>
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  value={formState.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {formState.questions.map((question, index) => (
            <div 
              key={question.id} 
              className={`bg-white p-6 rounded-lg shadow-md cursor-pointer ${currentQuestionIndex === index ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{question.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {QUESTION_TYPES.find(t => t.id === question.type)?.label}
                    {question.required && ' • Required'}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    moveQuestion(index, 'up');
                  }}>
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    moveQuestion(index, 'down');
                  }}>
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    duplicateQuestion(index);
                  }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    removeQuestion(index);
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <Button onClick={addQuestion} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </Button>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={saveForm}>Save Form</Button>
          </div>
        </div>
        
        <div>
          {renderQuestionEditor()}
          
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-medium mb-4">Form Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collect-email"
                  checked={formState.settings.collectEmail}
                  onCheckedChange={(checked) => 
                    handleSettingsChange('collectEmail', checked)
                  }
                />
                <Label htmlFor="collect-email">Collect Email Addresses</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-public"
                  checked={formState.settings.isPublic}
                  onCheckedChange={(checked) => 
                    handleSettingsChange('isPublic', checked)
                  }
                />
                <Label htmlFor="is-public">Make Form Public</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiple-responses"
                  checked={formState.settings.allowMultipleResponses}
                  onCheckedChange={(checked) => 
                    handleSettingsChange('allowMultipleResponses', checked)
                  }
                />
                <Label htmlFor="multiple-responses">Allow Multiple Responses</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-progress"
                  checked={formState.settings.showProgressBar}
                  onCheckedChange={(checked) => 
                    handleSettingsChange('showProgressBar', checked)
                  }
                />
                <Label htmlFor="show-progress">Show Progress Bar</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shuffle-questions"
                  checked={formState.settings.shuffleQuestions}
                  onCheckedChange={(checked) => 
                    handleSettingsChange('shuffleQuestions', checked)
                  }
                />
                <Label htmlFor="shuffle-questions">Shuffle Questions</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};