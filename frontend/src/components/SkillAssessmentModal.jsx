import React from "react";

const SkillAssessmentModal = ({ selectedSkill, onClose, onStart }) => {
    if (!selectedSkill) return null;

    console.log("selectedskill", selectedSkill);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-xl font-semibold">Verify {selectedSkill.skill_name}</h2>
                <p className="mt-2 text-gray-300">
                    Take our quick 15-minute test to verify your proficiency in <strong>{selectedSkill.skill_name}</strong>.
                </p>
                <p className="mt-4 text-gray-300">
                    You will be presented with 15 technical questions related to this topic. To successfully verify your skill, you must answer at least 7 of these questions correctly.
                    <br /><br />
                    We encourage you to attempt the test on your own without external help. This is a valuable opportunity to evaluate your current knowledge, identify areas for improvement, and track your growth. Cheating or attempting to bypass the test would not only hinder your personal development but also defeat the purpose of certification.
                    <br /><br />
                    Remember, you can always reattempt the assessment if needed, and we are here to support you throughout your learning journey!
                </p>
                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onStart(selectedSkill)}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Start Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillAssessmentModal;
