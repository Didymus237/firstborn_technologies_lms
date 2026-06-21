import React, { useState, useEffect, useRef } from 'react';
import { api, baseURL } from '@/lib/api';
import { useAuth } from '@/hooks/AuthProvider';
import { Camera, Edit2, Save, X, Phone, BookOpen, Briefcase, Mail, Hash, User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user: authUser, setUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data.user);
      setEditFormData(res.data.user);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        phone: editFormData.phone,
        presentAddress: editFormData.presentAddress,
        permanentAddress: editFormData.permanentAddress,
        fatherName: editFormData.fatherName,
        dob: editFormData.dob,
        country: editFormData.country,
        passportNumber: editFormData.passportNumber,
      };
      const res = await api.put('/users/profile', payload);
      setProfile(res.data.user);
      if (setUser) setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validate
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPG and PNG images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const newPhotoUrl = res.data.url;
      // Immediately save to profile
      const updateRes = await api.put('/users/profile', { photoUrl: newPhotoUrl });
      setProfile(updateRes.data.user);
      if (setUser) setUser(updateRes.data.user);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-gray-500">Failed to load profile data.</div>;
  }

  // Construct absolute image URL
  const displayPhoto = profile.photoUrl?.startsWith('http') 
    ? profile.photoUrl 
    : profile.photoUrl ? `${baseURL}${profile.photoUrl}` : 'https://ui-avatars.com/api/?name=' + profile.name;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg relative">
                  <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
                      <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full"></div>
                    </div>
                  )}
                </div>
                {!uploading && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/jpeg, image/png" 
                  onChange={handleImageUpload} 
                />
              </div>

              {!isEditing ? (
                <button 
                  onClick={() => {
                    setEditFormData(profile);
                    setIsEditing(true);
                  }}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 capitalize">
                  {profile.role}
                </span>
                <span className="text-gray-500 font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" /> {profile.email}
                </span>
                {(profile.rollNumber || profile.enrollmentNumber) && (
                  <span className="text-gray-500 font-medium flex items-center">
                    <Hash className="w-4 h-4 mr-1 text-gray-400" /> 
                    {profile.rollNumber || profile.enrollmentNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
              <User className="w-5 h-5 mr-2 text-indigo-500" /> Personal Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Father's Name</label>
                {isEditing ? (
                  <input 
                    type="text" name="fatherName" value={editFormData.fatherName || ''} onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.fatherName || <span className="text-gray-400 italic">Not provided</span>}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input 
                    type="date" name="dob" 
                    value={editFormData.dob ? new Date(editFormData.dob).toISOString().split('T')[0] : ''} 
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium flex items-center">
                    {profile.dob ? new Date(profile.dob).toLocaleDateString() : <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                )}
              </div>
              
              {profile.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Country of Origin</label>
                    {isEditing ? (
                      <select 
                        name="country" value={editFormData.country || 'India'} onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium text-gray-900"
                      >
                        <option value="Algeria">Algeria</option>
                        <option value="Angola">Angola</option>
                        <option value="Benin">Benin</option>
                        <option value="Botswana">Botswana</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Burundi">Burundi</option>
                        <option value="Cabo Verde">Cabo Verde</option>
                        <option value="Cameroon">Cameroon</option>
                        <option value="Central African Republic">Central African Republic</option>
                        <option value="Chad">Chad</option>
                        <option value="Comoros">Comoros</option>
                        <option value="Congo">Congo (Brazzaville)</option>
                        <option value="DR Congo">Congo (Kinshasa)</option>
                        <option value="Djibouti">Djibouti</option>
                        <option value="Egypt">Egypt</option>
                        <option value="Equatorial Guinea">Equatorial Guinea</option>
                        <option value="Eritrea">Eritrea</option>
                        <option value="Eswatini">Eswatini</option>
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Gabon">Gabon</option>
                        <option value="Gambia">Gambia</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Guinea">Guinea</option>
                        <option value="Guinea-Bissau">Guinea-Bissau</option>
                        <option value="Ivory Coast">Ivory Coast (Côte d'Ivoire)</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Lesotho">Lesotho</option>
                        <option value="Liberia">Liberia</option>
                        <option value="Libya">Libya</option>
                        <option value="Madagascar">Madagascar</option>
                        <option value="Malawi">Malawi</option>
                        <option value="Mali">Mali</option>
                        <option value="Mauritania">Mauritania</option>
                        <option value="Mauritius">Mauritius</option>
                        <option value="Morocco">Morocco</option>
                        <option value="Mozambique">Mozambique</option>
                        <option value="Namibia">Namibia</option>
                        <option value="Niger">Niger</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                        <option value="Senegal">Senegal</option>
                        <option value="Seychelles">Seychelles</option>
                        <option value="Sierra Leone">Sierra Leone</option>
                        <option value="Somalia">Somalia</option>
                        <option value="South Africa">South Africa</option>
                        <option value="South Sudan">South Sudan</option>
                        <option value="Sudan">Sudan</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Togo">Togo</option>
                        <option value="Tunisia">Tunisia</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                        <option value="Other">Other / Non-African</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.country || 'India'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Passport Number</label>
                    {isEditing ? (
                      <input 
                        type="text" name="passportNumber" value={editFormData.passportNumber || ''} onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium text-gray-900"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium font-mono">{profile.passportNumber || <span className="text-gray-400 italic">Not provided</span>}</p>
                    )}
                  </div>
                </>
              )}
              
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
              <Phone className="w-5 h-5 mr-2 text-indigo-500" /> Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                {isEditing ? (
                  <input 
                    type="text" name="phone" value={editFormData.phone || ''} onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Present Address</label>
                {isEditing ? (
                  <input 
                    type="text" name="presentAddress" value={editFormData.presentAddress || ''} onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium flex items-center">
                    {profile.presentAddress || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Permanent Address</label>
                {isEditing ? (
                  <input 
                    type="text" name="permanentAddress" value={editFormData.permanentAddress || ''} onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium flex items-center">
                    {profile.permanentAddress || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic/Professional Details (Read-only) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
              {profile.role === 'student' ? <BookOpen className="w-5 h-5 mr-2 text-indigo-500" /> : <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />}
              {profile.role === 'student' ? 'Academic Information' : 'Professional Assignments'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {profile.role === 'student' && (
                <>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Class Enrolled</label>
                    <p className="text-gray-900 font-bold text-lg">{profile.studentClass?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Training Program</label>
                    <p className="text-gray-900 font-bold text-lg">{profile.department || 'General'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Roll / Enrollment ID</label>
                    <p className="text-gray-900 font-bold text-lg">{profile.rollNumber || profile.enrollmentNumber || 'Pending'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Internship Source (School)</label>
                    <p className="text-gray-900 font-bold text-lg">{profile.internshipSchool || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Training Duration</label>
                    <p className="text-gray-900 font-bold text-lg">{profile.trainingDuration || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Training Term</label>
                    <p className="text-gray-900 font-bold text-sm">
                      {profile.trainingStartDate ? new Date(profile.trainingStartDate).toLocaleDateString() : 'N/A'} - {profile.trainingEndDate ? new Date(profile.trainingEndDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  {/* Financial Summary */}
                  <div className="bg-[#8B1E1E]/5 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                    <div className="bg-white p-4 rounded-xl border border-zinc-100">
                      <label className="block text-xs font-bold text-[#8B1E1E] uppercase tracking-wider mb-1">Total Fee</label>
                      <p className="text-gray-950 font-black text-2xl">₹{Number(profile.totalTrainingFee || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-zinc-100">
                      <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Paid Balance</label>
                      <p className="text-emerald-600 font-black text-2xl">₹{Number(profile.amountPaid || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-zinc-100">
                      <label className="block text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Pending Balance</label>
                      <p className="text-orange-600 font-black text-2xl">₹{Number(profile.amountPending || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}

              {profile.role === 'teacher' && (
                <>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Assigned Subjects</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.teacherSubjects?.length > 0 ? (
                         profile.teacherSubjects.map((sub: any) => (
                           <span key={sub._id} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                             {sub.name} ({sub.code})
                           </span>
                         ))
                      ) : (
                        <span className="text-gray-500">No subjects currently assigned.</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Employee ID</label>
                    <p className="text-gray-900 font-bold text-lg">{profile.enrollmentNumber || 'Pending'}</p>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
