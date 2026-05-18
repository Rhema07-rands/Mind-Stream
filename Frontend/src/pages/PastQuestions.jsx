import React from 'react';
import ResourceList from '../components/ResourceList';
import { HelpCircle } from 'lucide-react';

const PastQuestions = () => {
  return (
    <ResourceList 
      resourceType="past_question"
      title="Past Questions"
      subtitle="Access previous exam and test questions for preparation"
      icon={HelpCircle}
    />
  );
};

export default PastQuestions;
