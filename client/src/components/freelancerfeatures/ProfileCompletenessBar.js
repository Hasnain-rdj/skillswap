import React from 'react';

const ProfileCompletenessBar = ({ completeness = 0 }) => {
    return (
        <div className="mb-0 flex flex-col items-center min-w-[180px]">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                ></div>
            </div>
            <div className="text-xs mt-1 text-blue-700 font-semibold tracking-wide">{completeness}% complete</div>
        </div>
    );
};

export default ProfileCompletenessBar;
