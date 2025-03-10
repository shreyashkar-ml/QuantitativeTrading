
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Dashboard
    navigate('/');
  }, [navigate]);

  return null; // This component doesn't render anything as it just redirects
};

export default Index;
