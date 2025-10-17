const Dashboard = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to HealthFirst</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-blue-600 text-3xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Upcoming Appointments
          </h3>
          <p className="text-2xl font-bold text-gray-900">3</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-blue-600 text-3xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Medical Records
          </h3>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-blue-600 text-3xl mb-3">💊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Active Prescriptions
          </h3>
          <p className="text-2xl font-bold text-gray-900">2</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              DS
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Dr. Viduni Shakya</p>
              <p className="text-sm text-gray-600">Cardiology Appointment - Monday, Sep 8, 2025</p>
            </div>
            <span className="text-sm text-gray-500">Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
