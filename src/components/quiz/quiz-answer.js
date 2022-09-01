import React from 'react'

const QuizAnswer = ({answer, onCheck, checked, shouldReveal }) => {
    return <div className="quiz-answer">
        <label 
            style={{
                backgroundColor: 
                    shouldReveal ?
                        answer.is_valid ? '#70FF70' : 'pink'
                    : ''
                }
            }
        >
            <input 
                value={answer.id} 
                checked={checked}
                type="checkbox"
                onClick={onCheck}
            />
            {answer.description}
        </label>
    </div>
}

export default QuizAnswer