import React from 'react';
import ResourceList from '../components/ResourceList';
import { Video } from 'lucide-react';

const Videos = () => {
  return (
    <ResourceList 
      resourceType="video"
      title="Video Lectures"
      subtitle="Watch recorded lectures and educational videos"
      icon={Video}
    />
  );
};

export default Videos;
