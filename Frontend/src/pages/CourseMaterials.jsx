import React from 'react';
import ResourceList from '../components/ResourceList';
import { BookOpen } from 'lucide-react';

const CourseMaterials = () => {
  return (
    <ResourceList 
      resourceType="document"
      title="Course Materials"
      subtitle="Browse and download lecture notes, slides, and handouts"
      icon={BookOpen}
    />
  );
};

export default CourseMaterials;
