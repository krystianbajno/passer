import React from 'react';
import QuizAnswer from './quiz-answer';

const QuizQuestion = (props) => {
    const {
      question,
      shouldReveal,
      onAnswerChange,
      questionAnswers,
      questionIndex
    } = props

    return <div className="quiz-question"> 
        <h2>Question {questionIndex}</h2>
        <p className="quiz-description">
          {question.description}
        </p>

        {
          question.images.map(image => <div className="quiz-image">
            <img src={image}></img>
          </div>
        )}

        <div className="quiz-answers">
          {Object.keys(question.answers).map((answerId) => {
              const answer = question.answers[answerId]

              return <QuizAnswer
                checked={questionAnswers.includes(answer.id)}
                onCheck={(e) => onAnswerChange(e.target.value)}
                answer={answer} 
                shouldReveal={shouldReveal}
              />
          })}
        </div>
        <div className="question-explanation">
          {question.explanation && shouldReveal && <>Explanation: {question.explanation}<br></br></>}
        </div>
    </div>
}

export default QuizQuestion