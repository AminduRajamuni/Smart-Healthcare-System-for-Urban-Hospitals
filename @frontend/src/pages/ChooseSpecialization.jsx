import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepHeader from '../components/StepHeader';

const ChooseSpecialization = () => {
  const navigate = useNavigate();
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const specializations = [
    {
      id: 1,
      icon: '❤️',
      title: 'Cardiology',
      description: 'Heart and cardiovascular system',
    },
    {
      id: 2,
      icon: '🧠',
      title: 'Neurology',
      description: 'Brain and nervous system',
    },
    {
      id: 3,
      icon: '👁️',
      title: 'Ophthalmology',
      description: 'Eye and vision care',
    },
    {
      id: 4,
      icon: '🩺',
      title: 'General Medicine',
      description: 'Primary healthcare and wellness',
    },
    {
      id: 5,
      icon: '👶',
      title: 'Pediatrics',
      description: "Children's health and development",
    },
    {
      id: 6,
      icon: '🦴',
      title: 'Orthopedics',
      description: 'Bones, joints, and muscles',
    },
    {
      id: 7,
      icon: '✂️',
      title: 'Surgery',
      description: 'Surgical procedures and operations',
    },
    {
      id: 8,
      icon: '⚡',
      title: 'Emergency Medicine',
      description: 'Urgent and emergency care',
    },
  ];

  const filteredSpecializations = specializations.filter(
    (spec) =>
      spec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedSpecialization) {
      navigate('/appointments/step4');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <StepHeader title="Book Your Appointment" step={2} totalSteps={4} />

      {/* Title Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Medical Specialization
        </h2>
        <p className="text-gray-600 mb-6">
          Select the type of medical care you need
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search specializations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Specialization Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {filteredSpecializations.map((spec) => (
          <button
            key={spec.id}
            onClick={() => setSelectedSpecialization(spec.id)}
            className={`p-6 bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
              selectedSpecialization === spec.id
                ? 'border-blue-600 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{spec.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {spec.title}
              </h3>
              <p className="text-sm text-gray-500">{spec.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedSpecialization}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            selectedSpecialization
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ChooseSpecialization;
