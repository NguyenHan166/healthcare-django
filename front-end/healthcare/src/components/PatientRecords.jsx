import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientRecords = () => {
    const { user, loading, apiRequest } = useContext(AuthContext);
    const navigate = useNavigate();
    const [patientId, setPatientId] = useState('');
    const [records, setRecords] = useState([]);
    const [error, setError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Automatically fetch patient's own records if user is a patient
    useEffect(() => {
        if (user && user.role === 'PATIENT') {
            fetchRecords(user.id);
        }
    }, [user]);

    const fetchRecords = async (id) => {
        setFetchLoading(true);
        setError('');
        try {
            const data = await apiRequest('get', `http://localhost:8000/api/v1/medical-records/${id}/medical_records_details/`);
            // Handle single record or array
            setRecords(Array.isArray(data) ? data : [data]);
        } catch (error) {
            setError('Không thể tải bệnh án. Vui lòng kiểm tra lại.');
        }
        setFetchLoading(false);
    };

    const handlePatientIdSubmit = (e) => {
        e.preventDefault();
        if (!patientId) {
            setError('Vui lòng nhập ID bệnh nhân.');
            return;
        }
        fetchRecords(patientId);
    };

    const handleViewDetails = (record) => {
        setSelectedRecord(record);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedRecord(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-teal-100">
                <p className="text-teal-600 text-xl">Đang tải...</p>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    if (user.role !== 'DOCTOR' && user.role !== 'PATIENT') {
        navigate('/home');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 p-8 pt-24">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-teal-600 mb-6">Hồ Sơ Bệnh Nhân</h2>

                {/* Patient ID Form for Doctors */}
                {user.role === 'DOCTOR' && (
                    <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Tìm Bệnh Án</h3>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <form onSubmit={handlePatientIdSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID Bệnh Nhân</label>
                                <input
                                    type="text"
                                    value={patientId}
                                    onChange={(e) => setPatientId(e.target.value)}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Nhập ID bệnh nhân (UUID)"
                                    required
                                    disabled={fetchLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200 ${fetchLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={fetchLoading}
                            >
                                {fetchLoading ? 'Đang tải...' : 'Tìm Bệnh Án'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Medical Records List */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                        {user.role === 'PATIENT' ? 'Bệnh Án Của Bạn' : 'Danh Sách Bệnh Án'}
                    </h3>
                    {fetchLoading ? (
                        <p className="text-gray-600">Đang tải bệnh án...</p>
                    ) : records.length === 0 ? (
                        <p className="text-gray-600">Không có bệnh án nào.</p>
                    ) : (
                        <div className="space-y-4">
                            {records.map((record) => (
                                <div key={record.id} className="border-b pb-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Loại:</span> {record.record_type}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Thời gian:</span>{' '}
                                            {new Date(record.record_time).toLocaleString()}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Ghi chú:</span>{' '}
                                            {record.details.notes || 'Không có'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(record)}
                                        className="text-teal-600 hover:underline"
                                        disabled={detailsLoading}
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal for Record Details */}
                {modalOpen && selectedRecord && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full">
                            <h3 className="text-xl font-semibold text-teal-600 mb-4">Chi Tiết Bệnh Án</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="font-medium text-gray-700">ID Bệnh Án:</span> {selectedRecord.id}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Loại:</span> {selectedRecord.record_type}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Bệnh nhân:</span>{' '}
                                    {selectedRecord.patient_info.first_name} {selectedRecord.patient_info.last_name} (
                                    {selectedRecord.patient_info.email})
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Thời gian:</span>{' '}
                                    {new Date(selectedRecord.record_time).toLocaleString()}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Ghi chú:</span>{' '}
                                    {selectedRecord.details.notes || 'Không có'}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Thuốc:</span>
                                    {selectedRecord.details.medications && selectedRecord.details.medications.length > 0 ? (
                                        <ul className="list-disc pl-5">
                                            {selectedRecord.details.medications.map((med, index) => (
                                                <li key={index}>
                                                    {med.name} - {med.dosage}, {med.frequency}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'Không có'
                                    )}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Nhạy cảm:</span>{' '}
                                    {selectedRecord.is_sensitive ? 'Có' : 'Không'}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Ngày tạo:</span>{' '}
                                    {new Date(selectedRecord.created_at).toLocaleString()}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Ngày cập nhật:</span>{' '}
                                    {new Date(selectedRecord.updated_at).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="mt-6 w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientRecords;