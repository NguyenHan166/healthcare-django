import React, { useState } from 'react';
import Select from 'react-select';
import axios from 'axios';

// Danh sách triệu chứng (rút gọn phần đầu để bạn dễ sửa, còn đầy đủ bên dưới)
const symptomList = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering",
    "chills", "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting",
    "vomiting", "burning_micturition", "spotting_urination", "fatigue", "weight_gain",
    "anxiety", "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness",
    "lethargy", "patches_in_throat", "irregular_sugar_level", "cough", "high_fever",
    "sunken_eyes", "breathlessness", "sweating", "dehydration", "indigestion", "headache",
    "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes",
    "back_pain", "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine",
    "yellowing_of_eyes", "acute_liver_failure", "fluid_overload", "swelling_of_stomach",
    "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision", "phlegm",
    "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion",
    "chest_pain", "weakness_in_limbs", "fast_heart_rate", "pain_during_bowel_movements",
    "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", "dizziness",
    "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels",
    "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties",
    "excessive_hunger", "extra_marital_contacts", "drying_and_tingling_lips",
    "slurred_speech", "knee_pain", "hip_joint_pain", "muscle_weakness", "stiff_neck",
    "swelling_joints", "movement_stiffness", "spinning_movements", "loss_of_balance",
    "unsteadiness", "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort",
    "foul_smell_of_urine", "continuous_feel_of_urine", "passage_of_gases", "internal_itching",
    "toxic_look_(typhos)", "depression", "irritability", "muscle_pain", "altered_sensorium",
    "red_spots_over_body", "belly_pain", "abnormal_menstruation", "dischromic _patches",
    "watering_from_eyes", "increased_appetite", "polyuria", "family_history", "mucoid_sputum",
    "rusty_sputum", "lack_of_concentration", "visual_disturbances", "receiving_blood_transfusion",
    "receiving_unsterile_injections", "coma", "stomach_bleeding", "distention_of_abdomen",
    "history_of_alcohol_consumption", "fluid_overload.1", "blood_in_sputum",
    "prominent_veins_on_calf", "palpitations", "painful_walking", "pus_filled_pimples",
    "blackheads", "scurring", "skin_peeling", "silver_like_dusting", "small_dents_in_nails",
    "inflammatory_nails", "blister", "red_sore_around_nose", "yellow_crust_ooze"
];

const symptomOptions = symptomList.map(symptom => ({
    value: symptom,
    label: symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));

const ChatBot = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [result, setResult] = useState(null);

    const handleSubmit = async () => {
        const symptoms = selectedSymptoms.map(s => s.value);
        try {
            const response = await axios.post('http://localhost:5000/predict', { symptoms });
            setResult(response.data);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            setResult(null);
        }
    };

    return (
        <div className="chatbot-container" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: 900, margin: 'auto', backgroundColor: '#e0f5f5', borderRadius: '12px' }}>
            <h1 style={{ color: '#008080', fontSize: '2.5rem', textAlign: 'center' }}>🩺 Dự đoán bệnh từ triệu chứng</h1>

            <p style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: '1rem', color: '#2f4f4f' }}>Chọn các triệu chứng bạn đang gặp phải:</p>
            <Select
                options={symptomOptions}
                isMulti
                value={selectedSymptoms}
                onChange={setSelectedSymptoms}
                placeholder="Chọn triệu chứng..."
                styles={{
                    control: (provided) => ({
                        ...provided,
                        borderRadius: '8px',
                        borderColor: '#008080',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#008080' },
                    }),
                    menu: (provided) => ({
                        ...provided,
                        borderRadius: '8px',
                    }),
                    multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#008080',
                    }),
                    multiValueLabel: (provided) => ({
                        ...provided,
                        color: 'white',
                    }),
                    multiValueRemove: (provided) => ({
                        ...provided,
                        color: 'white',
                        ':hover': { backgroundColor: '#008080' },
                    }),
                }}
            />

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: '#008080',
                        color: 'white',
                        border: 'none',
                        padding: '0.8rem 2rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        transition: 'background-color 0.3s',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#00b3b3'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#008080'}
                >
                    Dự đoán
                </button>
            </div>

            {result && (
                <div style={{ marginTop: '2rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ color: '#006666', fontSize: '1.8rem' }}>🧾 Dự đoán: <span style={{ color: '#008080' }}>{result.prediction}</span></h2>
                    <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#333333' }}><strong>📖 Mô tả:</strong> {result.description}</p>
                    <div style={{ marginTop: '1.5rem' }}>
                        <strong>🛡️ Biện pháp phòng ngừa:</strong>
                        <ul style={{ paddingLeft: '1.2rem', fontSize: '1.1rem', color: '#555555' }}>
                            {result.precautions.map((precaution, index) => (
                                <li key={index}>✅ {precaution}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBot;
