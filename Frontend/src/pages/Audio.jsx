import React from 'react';
import ResourceList from '../components/ResourceList';
import { Headphones } from 'lucide-react';

const Audio = () => {
  return (
    <ResourceList 
      resourceType="audio"
      title="Audio Resources"
      subtitle="Listen to recorded lectures and academic podcasts"
      icon={Headphones}
    />
  );
};

export default Audio;
