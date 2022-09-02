import React from 'react'

const QuizAnswer = ({answer, onCheck, checked, shouldReveal }) => {
    return <div className="quiz-answer"
        style={{
            color:
                shouldReveal ? 'black'  : 'white',
            backgroundColor: 
                shouldReveal ?
                    answer.is_valid ? '#80FF80' : 'pink'
                : '',
            padding: "4px",
        }}
    >
        <label>
            <input 
                value={answer.id} 
                checked={checked}
                defaultChecked={checked}
                type="checkbox"
                onChange={onCheck}
            />
            {answer.description}
        </label>
    </div>
}

export default QuizAnswer