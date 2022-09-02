import JSZip from "jszip"
import React from "react"
import csv from 'jquery-csv';
import pJson from "../../package.json"
import QuizQuestion from "../components/quiz/quiz-question";

class Quiz extends React.Component {
  state = {
    questions: {},
    answers: {},
    examMode: true,
    examFinished: false,
    currentQuestionId: null,
    currentQuestionAnswers: [],
    questionsOrder: []
  }

  init = async () => {
    this.setState({
      questions: {},
      answers: {},
      examMode: true,
      examFinished: false,
      currentQuestionId: null,
      currentQuestionAnswers: [],
      questionsOrder: []
    })
  }

  restart = async () => {
    this.setState((previous, props) => ({
      answers: {},
      examFinished: false,
      currentQuestionId: this.state.questionsOrder[0],
      currentQuestionAnswers: []
    }))
  }

  unmarshall = async (examFile) => {
    await this.init()
    const state = Object.assign({}, this.state)

    const zip = new JSZip();
    
    let read, answers, questions, questionsData
    
    read = await zip.loadAsync(examFile)
    answers = csv.toObjects(await read.file("answers.csv").async("string"))
    questions = csv.toObjects(await read.file("questions.csv").async("string"))
    questionsData = csv.toObjects(await read.file("questions_data.csv").async("string"))

    for (const question of questions) {
      question.answers = {}
      question.images = []
      state.questions[question.id] = question
      state.questionsOrder.push(question.id)
    }

    for (const answer of answers) {
      answer.is_valid = answer.is_valid === "true"
      state.questions[answer.question_id].answers[answer.id] = answer
    }

    for (const questionData of questionsData) {
      const image = await read.file(questionData.path).async("blob")
      const imageURL = URL.createObjectURL(image);
      state.questions[questionData.question_id].images.push(imageURL)
    }

    state.currentQuestionId = state.questionsOrder[0]

    this.setState((previousState, props) => (state))
  }

  wasQuestionAnsweredCorrectly = (selectedQuestionAnswers, allQuestionAnswers) => {
    if (!selectedQuestionAnswers) {
      return false
    }

    for (const questionAnswerId of Object.keys(allQuestionAnswers)) {
      const questionAnswer = allQuestionAnswers[questionAnswerId]
      if (!questionAnswer.is_valid && selectedQuestionAnswers.includes(questionAnswerId)) {
        return false;
      }
      if (questionAnswer.is_valid && !selectedQuestionAnswers.includes(questionAnswerId)) {
        return false;
      }
    }

    return true
  }

  wasSpecifiedQuestionAnsweredCorrectly(questionId) {
    const selectedQuestionAnswers = this.state.answers[questionId]
    const allQuestionAnswers = this.state.questions[questionId].answers

    return this.wasQuestionAnsweredCorrectly(selectedQuestionAnswers, allQuestionAnswers)
  }

  
  scoreCalculator = () => {
    let points = 0
    const perQuestion = 10
    const questionCount = this.state.questionsOrder.length

    const maxPoints = perQuestion * questionCount

    for (const questionId of Object.keys(this.state.answers)) {
      if (this.wasSpecifiedQuestionAnsweredCorrectly(questionId)) {
        points = points + perQuestion
      } else {
        points = points - perQuestion * 2
      }
    }

    if (points < 0) {
      points = 0
    }

    const passed = points/maxPoints > 0.9

    return {maxPoints, points, passed}
  }

  shuffle = async () => {
    const shuffleArray = arr => {
      return Array(arr.length).fill(null)
        .map((_, i) => [Math.random(), i])
        .sort(([a], [b]) => a - b)
        .map(([, i]) => arr[i])
    }

    this.setState((previous, props) => ({
      questionsOrder: shuffleArray(previous.questionsOrder)
    }))

    this.restart()
  }

  questionWasAnswered = (questionId) => {
    return !!this.state.answers[questionId]
  }

  shouldHighlightRightWrong = () => {
    return (!this.state.examMode && this.questionWasAnswered(this.state.currentQuestionId)) || this.state.examFinished
  }

  isLastQuestion = () => {
    return this.state.questionsOrder.indexOf(this.state.currentQuestionId) == (this.state.questionsOrder.length - 1)
  }

  isFirstQuestion = () => {
    return this.state.questionsOrder.indexOf(this.state.currentQuestionId) == 0
  }

  answerQuestion = () => {
    const state = this.state
    const questionId = state.currentQuestionId
    const answerIds = state.currentQuestionAnswers

    if (state.answers[this.state.currentQuestionId]) {
      delete state.answers[questionId]
    }

    state.answers[questionId] = answerIds
    state.currentQuestionAnswers = []
    this.setState(() => state)
  }

  answerQuestionPrevious = () => {
    const state = this.state
    const questionId = state.currentQuestionId
    const answerIds = state.currentQuestionAnswers

    if (state.answers[this.state.currentQuestionId]) {
      state.answers[questionId] = answerIds
      state.currentQuestionAnswers = []
      this.setState(() => state)
    }
  }

  nextQuestion = () => {
    this.answerQuestion()
    const index = this.state.questionsOrder.indexOf(this.state.currentQuestionId)

    if (this.state.questionsOrder[index + 1]) {
      this.setState((prev, props) => ({
        currentQuestionId: this.state.questionsOrder[index + 1],
        currentQuestionAnswers: this.state.answers[this.state.questionsOrder[index + 1]] || []
      }))
    }
  }

  previousQuestion = () => {
    this.answerQuestionPrevious()
    const index = this.state.questionsOrder.indexOf(this.state.currentQuestionId)
    
    if (this.state.questionsOrder[index - 1]) {
      this.setState((prev, props) => ({
        currentQuestionId: this.state.questionsOrder[index - 1],
        currentQuestionAnswers: this.state.answers[this.state.questionsOrder[index - 1]] || []
      }))
    }
  }

  finishExam = () => {
    this.answerQuestion()
    this.setState((previous, props) => ({
      examFinished: true,
    }))
  }

  render = () => {
    const question = this.state.questions[this.state.currentQuestionId]

    const score = this.scoreCalculator()

    return <div className="quiz">
      <h1 className="quiz-head">Passer Quiz {pJson.version}</h1>
      <a className="quiz-nav" href="/creator">Creator</a>
      <h3 className="quiz-greets">Good luck, have fun :)</h3>

      <div className="control-panel">
        <input className="exam-input" type="file" onChange={(e) => this.unmarshall(e.target.files[0])}></input>
        <button className="shuffle" onClick={() => this.shuffle()}>Shuffle</button>
        <button className="restart" onClick={() => this.restart()}>Restart</button>
        <label><input type="checkbox" onClick={() => this.setState((previousState, props) => ({
          examMode: !previousState.examMode
        }))} checked={this.state.examMode}/>{this.state.examMode} Exam mode</label>
      </div>
      <div className="quiz-body">
        {(this.state.examFinished || !this.state.examMode) && 
          <div>
            <div>Passed: {score.passed ? "Yes" : "No"}</div>
            <div>Score: {score.points}/{score.maxPoints}</div>
          </div>
        }

        {!this.state.examFinished ? (question && <QuizQuestion
          onAnswerChange={(c) => {
            this.setState((previous, props) => {
              const toChange = previous.currentQuestionAnswers

              if (!previous.currentQuestionAnswers.includes(c)) {
                toChange.push(c)
              } else {
                toChange.splice(toChange.indexOf(c), 1)
              }

              return {
                currentQuestionAnswers: toChange
              }
            })
          }}
          questionIndex={this.state.questionsOrder.indexOf(question.id)}
          questionAnswers={this.state.currentQuestionAnswers}
          questionAnsweredCorrectly={this.wasSpecifiedQuestionAnsweredCorrectly(question.id)}
          question={question}
          shouldReveal={this.shouldHighlightRightWrong()}
        />) : <div>
          <h3>Answered incorrectly: </h3>
          {Object.keys(this.state.questions).filter((q) => {
            return !this.wasSpecifiedQuestionAnsweredCorrectly(q)
          }).map(q => {
            const question = this.state.questions[q]
            const finalQuestionAnswers = this.state.answers[
              this.state.questionsOrder[this.state.questionsOrder.indexOf(question.id)]
            ]

            return <QuizQuestion
              onAnswerChange={() => false}
              questionIndex={this.state.questionsOrder.indexOf(question.id)}
              questionAnsweredCorrectly={this.wasSpecifiedQuestionAnsweredCorrectly(question.id)}
              questionAnswers={finalQuestionAnswers}
              question={question}
              shouldReveal={true}
            />
          })}
        </div>}
      </div>
      {(!this.state.examFinished && this.state.questionsOrder.length) ? <div className="control-panel">
            { !this.isFirstQuestion() &&  
              <button onClick={() => this.previousQuestion()} className="previous-question">Previous</button>}
          
            { !this.isLastQuestion() && 
              <button onClick={() => this.nextQuestion()} className="next-question">Next</button>}

            { (this.isLastQuestion()) &&
              <button onClick={() => this.finishExam()} className="finish-question">Finish exam</button>}
      </div> : <></>}
    </div>
  }
}

export default Quiz;