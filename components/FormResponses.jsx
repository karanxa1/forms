'use client';

import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { BarChart, Download, FileJson, FileSpreadsheet } from 'lucide-react';

const FormResponses = ({ formId }) => {
  const { getForm, getResponses, exportResponsesAsJSON, exportResponsesAsCSV } = useFormContext();
  const [view, setView] = useState('table'); // 'table' or 'analytics'
  
  const form = getForm(formId);
  const responses = getResponses(formId);
  
  if (!form) {
    return <div className="p-8 text-center">Form not found</div>;
  }
  
  const handleExportJSON = () => {
    exportResponsesAsJSON(formId);
  };
  
  const handleExportCSV = () => {
    exportResponsesAsCSV(formId);
  };
  
  const renderTableView = () => {
    if (responses.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No responses yet</p>
        </div>
      );
    }
    
    // Get all unique question IDs from the form
    const questionIds = form.questions.map(q => q.id);
    
    // Create a mapping of question IDs to their titles for the table header
    const questionTitles = {};
    form.questions.forEach(q => {
      questionTitles[q.id] = q.title;
    });
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left border">Response ID</th>
              <th className="p-2 text-left border">Submitted At</th>
              {questionIds.map(id => (
                <th key={id} className="p-2 text-left border">{questionTitles[id]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map(response => (
              <tr key={response.id} className="border-b hover:bg-muted/50">
                <td className="p-2 border">{response.id}</td>
                <td className="p-2 border">{formatDate(response.submittedAt)}</td>
                {questionIds.map(id => {
                  const value = response.data[id];
                  let displayValue = value;
                  
                  // Handle array values (like checkbox responses)
                  if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  }
                  
                  return (
                    <td key={id} className="p-2 border">{displayValue || '-'}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderAnalyticsView = () => {
    if (responses.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No responses to analyze</p>
        </div>
      );
    }
    
    // Simple analytics for each question
    return (
      <div className="space-y-8">
        {form.questions.map(question => {
          // Skip text-based questions for analytics
          if (['short_text', 'long_text', 'email', 'phone', 'date'].includes(question.type)) {
            return (
              <div key={question.id} className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">{question.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Text-based responses - {responses.filter(r => r.data[question.id]).length} answers
                </p>
              </div>
            );
          }
          
          // For choice-based questions, count occurrences of each option
          if (['multiple_choice', 'checkbox', 'dropdown'].includes(question.type)) {
            const optionCounts = {};
            
            // Initialize counts
            question.options.forEach(option => {
              optionCounts[option.value] = 0;
            });
            
            // Count responses
            responses.forEach(response => {
              const value = response.data[question.id];
              
              if (Array.isArray(value)) { // Checkbox responses
                value.forEach(v => {
                  if (optionCounts[v] !== undefined) {
                    optionCounts[v]++;
                  }
                });
              } else if (value) { // Single choice responses
                if (optionCounts[value] !== undefined) {
                  optionCounts[value]++;
                }
              }
            });
            
            // Calculate percentages
            const totalResponses = responses.length;
            const percentages = {};
            
            Object.keys(optionCounts).forEach(option => {
              percentages[option] = Math.round((optionCounts[option] / totalResponses) * 100);
            });
            
            return (
              <div key={question.id} className="p-4 border rounded-md">
                <h3 className="font-medium mb-4">{question.title}</h3>
                
                <div className="space-y-2">
                  {question.options.map(option => (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{option.value}</span>
                        <span>{optionCounts[option.value]} responses ({percentages[option.value]}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentages[option.value]}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          
          // For number questions, show average, min, max
          if (question.type === 'number') {
            const numbers = responses
              .map(r => r.data[question.id])
              .filter(v => v && !isNaN(Number(v)))
              .map(v => Number(v));
            
            if (numbers.length === 0) {
              return (
                <div key={question.id} className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">{question.title}</h3>
                  <p className="text-sm text-muted-foreground">No numeric responses</p>
                </div>
              );
            }
            
            const average = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
            const min = Math.min(...numbers);
            const max = Math.max(...numbers);
            
            return (
              <div key={question.id} className="p-4 border rounded-md">
                <h3 className="font-medium mb-4">{question.title}</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="font-medium">{average.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-sm text-muted-foreground">Minimum</p>
                    <p className="font-medium">{min}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-sm text-muted-foreground">Maximum</p>
                    <p className="font-medium">{max}</p>
                  </div>
                </div>
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };
  
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{form.title} - Responses</h1>
        <div className="flex space-x-2">
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            onClick={() => setView('table')}
          >
            Table View
          </Button>
          <Button
            variant={view === 'analytics' ? 'default' : 'outline'}
            onClick={() => setView('analytics')}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-muted-foreground">
              {responses.length} {responses.length === 1 ? 'response' : 'responses'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportJSON} disabled={responses.length === 0}>
              <FileJson className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={responses.length === 0}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        
        {view === 'table' ? renderTableView() : renderAnalyticsView()}
      </div>
    </div>
  );
};

export default FormResponses;