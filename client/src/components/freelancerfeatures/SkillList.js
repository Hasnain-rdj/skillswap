import React from 'react';

const SkillList = ({ skills = [], onChange, readOnly }) => {
    const [input, setInput] = React.useState('');

    const addSkill = () => {
        if (input.trim() && !skills.includes(input.trim())) {
            onChange([...skills, input.trim()]);
            setInput('');
        }
    };

    const removeSkill = (skill) => {
        onChange(skills.filter(s => s !== skill));
    };

    return (
        <div className="mb-6 w-full">
            <label className="block font-semibold mb-2 text-blue-700 text-lg">Skills:</label>
            {!readOnly && (
                <div className="flex mb-4 gap-2">
                    <input
                        className="border-2 border-blue-200 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 transition"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Add a skill"
                    />
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition flex items-center gap-1" onClick={addSkill} type="button">
                        + Add
                    </button>
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {skills.length === 0 && <span className="text-blue-400 italic">No skills added yet.</span>}
                {skills.map(skill => (
                    <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center font-semibold shadow-sm">
                        {skill}
                        {!readOnly && (
                            <button className="ml-2 text-red-500 font-bold hover:text-red-700 transition text-lg" onClick={() => removeSkill(skill)} type="button">&times;</button>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default SkillList;
