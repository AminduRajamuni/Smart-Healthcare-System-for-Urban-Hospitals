import { useNavigate } from 'react-router-dom';

const StepHeader = ({ title, step, totalSteps }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 mb-4 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
      >
        <span>←</span>
        <span>Back</span>
      </button>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500">
          Step {step} of {totalSteps}: {getStepDescription(step)}
        </p>
      </div>
    </div>
  );
};

const getStepDescription = (step) => {
  const descriptions = {
    1: 'Select Date & Time',
    2: 'Choose Medical Specialization',
    3: 'Choose Doctor',
    4: 'Patient Information',
  };
  return descriptions[step] || '';
};

export default StepHeader;
